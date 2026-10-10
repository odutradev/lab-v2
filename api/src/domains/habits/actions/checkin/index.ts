import { rangeSummaryResponseSchema, toggleCheckinResponseSchema, rangeSummaryQuerySchema, daySummaryResponseSchema, toggleCheckinBodySchema, daySummaryQuerySchema } from '@domains/habits/actions/checkin/schemas'
import habitCheckinRepository from '@domains/habits/repositories/habitCheckin'
import authMiddlewareWithDocs from '@domains/users/middlewares/auth'
import habitRepository from '@domains/habits/repositories/habit'
import { isHabitScheduledForDate } from '@domains/habits/utils/recurrence'
import { formatTimestamp } from '@utils/date'
import { isValidObjectId } from '@database/utils'
import defineAction from '@factories/defineAction'
import createAuditLog from '@createAuditLog'
import userRepository from '@domains/users/repositories/user'
import { listUserGoogleCalendars, fetchGoogleCalendarEvents } from '@google/utils'
import createLocalLogger from '@utils/localLogger'

import type { RangeSummaryResponse, ToggleCheckinResponse, DaySummaryResponse, RangeSummaryQuery, ToggleCheckinBody, DaySummaryQuery, DaySummaryItem } from '@domains/habits/actions/checkin/types'

const logger = createLocalLogger('checkin-actions')

const fetchExternalCalendarItems = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<Map<string, DaySummaryItem[]>> => {
  const result = new Map<string, DaySummaryItem[]>()
  try {
    const user = await userRepository.findWithGoogleCalendarRefreshToken(userId)
    const isConnected = !!user?.integrations?.googleCalendar?.connected
    const refreshToken = user?.integrations?.googleCalendar?.refreshToken
    const selectedIds = user?.integrations?.googleCalendar?.selectedCalendarIds || []
    const labCalendarId = user?.integrations?.googleCalendar?.calendarId

    if (!isConnected || !refreshToken || selectedIds.length === 0) {
      return result
    }

    const externalIds = selectedIds.filter((id) => id !== labCalendarId)
    if (externalIds.length === 0) {
      return result
    }

    let metaMap: Map<string, { summary: string; color?: string }> | undefined
    try {
      const gcalList = await listUserGoogleCalendars(refreshToken)
      metaMap = new Map(gcalList.map((c) => [c.id, { summary: c.summary, color: c.backgroundColor }]))
    } catch {
      // continua sem metaMap se falhar listagem
    }

    const events = await fetchGoogleCalendarEvents(
      refreshToken,
      externalIds,
      `${startDate}T00:00:00Z`,
      `${endDate}T23:59:59Z`,
      metaMap
    )

    for (const ev of events) {
      const item: DaySummaryItem = {
        habitId: `gcal_${ev.id}`,
        title: ev.summary,
        description: ev.description,
        category: 'schedule',
        frequency: 'none',
        startDate: ev.date,
        allDay: ev.allDay,
        startTime: ev.startTime,
        endTime: ev.endTime,
        completed: false,
        readOnly: true,
        calendarId: ev.calendarId,
        calendarName: ev.calendarName,
        calendarColor: ev.calendarColor
      }

      const list = result.get(ev.date) || []
      list.push(item)
      result.set(ev.date, list)
    }
  } catch (err) {
    logger.warn('Failed to load external google calendar events:', err)
  }

  return result
}


export const toggleCheckinAction = defineAction(
  {
    method: 'post',
    path: '/habits/checkins/toggle',
    summary: 'Marca ou desmarca a conclusão de uma meta/hábito para uma data',
    tags: ['Habits'],
    authenticate: true,
    schema: {
      body: toggleCheckinBodySchema
    },
    responses: {
      200: {
        description: 'Status de conclusão do hábito atualizado',
        schema: toggleCheckinResponseSchema
      },
      404: {
        description: 'Hábito não localizado'
      }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { habitId, date, completed } = data as ToggleCheckinBody
    if (!isValidObjectId(habitId)) return manageError({ code: 'bad_request' })

    const habit = await habitRepository.findByIdAndUser(habitId, ids.userId)
    if (!habit) return manageError({ code: 'not_found' })

    const targetDate = date || formatTimestamp().split(' ')[0]
    const existingCheckin = await habitCheckinRepository.findByUserHabitAndDate(ids.userId, habitId, targetDate)

    const nextCompleted = typeof completed === 'boolean'
      ? completed
      : existingCheckin
        ? !existingCheckin.completed
        : true

    await habitCheckinRepository.upsertCheckin({
      userId: ids.userId,
      habitId,
      date: targetDate,
      completed: nextCompleted
    })

    await createAuditLog({
      actorId: ids.userId,
      action: 'toggle_habit_checkin',
      entity: 'HabitCheckin',
      entityId: habitId,
      summary: 'Status do hábito modificado para a data.',
      details: { habitId, date: targetDate, completed: nextCompleted }
    })

    return {
      habitId,
      date: targetDate,
      completed: nextCompleted
    }
  }
)

export const getDaySummaryAction = defineAction(
  {
    method: 'get',
    path: '/habits/day-summary',
    summary: 'Calcula o resumo diário e taxa de aproveitamento das metas na data',
    tags: ['Habits'],
    authenticate: true,
    schema: {
      query: daySummaryQuerySchema
    },
    responses: {
      200: {
        description: 'Resumo e índice de aproveitamento do dia',
        schema: daySummaryResponseSchema
      }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, query, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const parsedQuery = query as DaySummaryQuery
    const targetDate = parsedQuery.date || formatTimestamp().split(' ')[0]

    const activeHabits = await habitRepository.findAllByUser(ids.userId, { active: true })
    const checkins = await habitCheckinRepository.findByUserAndDate(ids.userId, targetDate)

    const checkinMap = new Map(checkins.map((item) => [item.habitId.toString(), item.completed]))

    const items: DaySummaryItem[] = activeHabits
      .filter((habit) => {
        if (checkinMap.has(habit.id.toString())) return true
        return isHabitScheduledForDate(habit, targetDate)
      })
      .map((habit) => {
        const habitId = habit.id.toString()
        const completed = checkinMap.get(habitId) ?? false

        return {
          habitId,
          title: habit.title,
          description: habit.description,
          category: habit.category || 'event',
          frequency: habit.frequency,
          startDate: habit.startDate,
          allDay: habit.allDay,
          startTime: habit.startTime,
          endTime: habit.endTime,
          completed
        }
      })
      .sort((a, b) => {
        if (a.allDay && !b.allDay) return -1
        if (!a.allDay && b.allDay) return 1
        return (a.startTime || '').localeCompare(b.startTime || '')
      })

    const totalHabits = items.length
    const completedHabits = items.filter((item) => item.completed).length
    const completionRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0

    const externalItemsMap = await fetchExternalCalendarItems(ids.userId, targetDate, targetDate)
    const externalItems = externalItemsMap.get(targetDate) || []

    const allItems = [...items, ...externalItems].sort((a, b) => {
      if (a.allDay && !b.allDay) return -1
      if (!a.allDay && b.allDay) return 1
      return (a.startTime || '').localeCompare(b.startTime || '')
    })

    const summary: DaySummaryResponse = {
      date: targetDate,
      totalHabits,
      completedHabits,
      completionRate,
      items: allItems
    }

    return summary
  }
)

export const getRangeSummaryAction = defineAction(
  {
    method: 'get',
    path: '/habits/range-summary',
    summary: 'Calcula o resumo diário e taxa de aproveitamento das metas para um intervalo de datas',
    tags: ['Habits'],
    authenticate: true,
    schema: {
      query: rangeSummaryQuerySchema
    },
    responses: {
      200: {
        description: 'Lista de resumos e aproveitamentos no intervalo',
        schema: rangeSummaryResponseSchema
      }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, query, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { startDate, endDate } = query as RangeSummaryQuery

    const activeHabits = await habitRepository.findAllByUser(ids.userId, { active: true })
    const checkins = await habitCheckinRepository.findByUserAndDateRange(ids.userId, startDate, endDate)
    const externalItemsMap = await fetchExternalCalendarItems(ids.userId, startDate, endDate)

    const checkinsByDateAndHabit = new Map<string, boolean>()
    checkins.forEach((item) => {
      checkinsByDateAndHabit.set(`${item.date}_${item.habitId.toString()}`, item.completed)
    })

    const dates: string[] = []
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number)
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number)
    const current = new Date(startYear, startMonth - 1, startDay)
    const end = new Date(endYear, endMonth - 1, endDay)

    while (current <= end) {
      const yyyy = current.getFullYear()
      const mm = String(current.getMonth() + 1).padStart(2, '0')
      const dd = String(current.getDate()).padStart(2, '0')
      dates.push(`${yyyy}-${mm}-${dd}`)
      current.setDate(current.getDate() + 1)
    }

    const summaries: DaySummaryResponse[] = dates.map((dateStr) => {
      const items: DaySummaryItem[] = activeHabits
        .filter((habit) => {
          if (checkinsByDateAndHabit.has(`${dateStr}_${habit.id.toString()}`)) return true
          return isHabitScheduledForDate(habit, dateStr)
        })
        .map((habit) => {
          const habitId = habit.id.toString()
          const completed = checkinsByDateAndHabit.get(`${dateStr}_${habitId}`) ?? false

          return {
            habitId,
            title: habit.title,
            description: habit.description,
            category: habit.category || 'event',
            frequency: habit.frequency,
            startDate: habit.startDate,
            allDay: habit.allDay,
            startTime: habit.startTime,
            endTime: habit.endTime,
            completed
          }
        })
        .sort((a, b) => {
          if (a.allDay && !b.allDay) return -1
          if (!a.allDay && b.allDay) return 1
          return (a.startTime || '').localeCompare(b.startTime || '')
        })

      const totalHabits = items.length
      const completedHabits = items.filter((item) => item.completed).length
      const completionRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0

      const externalItems = externalItemsMap.get(dateStr) || []
      const allItems = [...items, ...externalItems].sort((a, b) => {
        if (a.allDay && !b.allDay) return -1
        if (!a.allDay && b.allDay) return 1
        return (a.startTime || '').localeCompare(b.startTime || '')
      })

      return {
        date: dateStr,
        totalHabits,
        completedHabits,
        completionRate,
        items: allItems
      }
    })

    return summaries
  }
)
