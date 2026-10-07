import { rangeSummaryResponseSchema, toggleCheckinResponseSchema, rangeSummaryQuerySchema, daySummaryResponseSchema, toggleCheckinBodySchema, daySummaryQuerySchema } from '@domains/habits/actions/checkin/schemas'
import habitCheckinRepository from '@domains/habits/repositories/habitCheckin'
import authMiddlewareWithDocs from '@domains/users/middlewares/auth'
import habitRepository from '@domains/habits/repositories/habit'
import { isHabitScheduledForDate } from '@domains/habits/utils/recurrence'
import { formatTimestamp } from '@utils/date'
import { isValidObjectId } from '@database/utils'
import defineAction from '@factories/defineAction'
import createAuditLog from '@createAuditLog'

import type { RangeSummaryResponse, ToggleCheckinResponse, DaySummaryResponse, RangeSummaryQuery, ToggleCheckinBody, DaySummaryQuery, DaySummaryItem } from '@domains/habits/actions/checkin/types'

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

    const summary: DaySummaryResponse = {
      date: targetDate,
      totalHabits,
      completedHabits,
      completionRate,
      items
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

      return {
        date: dateStr,
        totalHabits,
        completedHabits,
        completionRate,
        items
      }
    })

    return summaries
  }
)
