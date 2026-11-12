import { rangeSummaryResponseSchema, toggleCheckinResponseSchema, rangeSummaryQuerySchema, daySummaryResponseSchema, toggleCheckinBodySchema, daySummaryQuerySchema } from './schemas'
import { getCachedUserGoogleCalendars, getCachedGoogleCalendarEvents } from '@google/cache'
import { formatDateKey, parseDateKey, addDays, countDaysBetween } from '@utils/date'
import habitCheckinRepository from '@domains/habits/repositories/habitCheckin'
import { isHabitScheduledForDate } from '@domains/habits/utils/recurrence'
import authMiddlewareWithDocs from '@domains/users/middlewares/auth'
import createAuditLog from '@domains/system/utils/createAuditLog'
import habitRepository from '@domains/habits/repositories/habit'
import userRepository from '@domains/users/repositories/user'
import createLocalLogger from '@utils/localLogger'
import defineAction from '@factories/defineAction'
import { isValidObjectId } from '@database/utils'

import type { RangeSummaryResponse, ToggleCheckinResponse, DaySummaryResponse, RangeSummaryQuery, ToggleCheckinBody, DaySummaryQuery, DaySummaryItem } from './types'
import type { HabitModelType } from '@domains/habits/repositories/habit/types'
import type { NormalizedGoogleEvent } from '@google/types'

const logger = createLocalLogger('checkin-actions')

type CalendarMetaMap = Map<string, { summary: string; color?: string }>

const sortByTime = (first: DaySummaryItem, second: DaySummaryItem): number => {
  if (first.allDay && !second.allDay) return -1
  if (!first.allDay && second.allDay) return 1
  return (first.startTime || '').localeCompare(second.startTime || '')
}

const listDateKeysInRange = (startDate: string, endDate: string): string[] => {
  const firstDay = parseDateKey(startDate)
  const totalDays = countDaysBetween(firstDay, parseDateKey(endDate)) + 1
  return Array.from({ length: Math.max(totalDays, 0) }, (_, index) => formatDateKey(addDays(firstDay, index)))
}

const loadCalendarMetaMap = async (userId: string, refreshToken: string): Promise<CalendarMetaMap | undefined> => {
  try {
    const googleCalendars = await getCachedUserGoogleCalendars(userId, refreshToken)
    return new Map(googleCalendars.map((calendar) => [calendar.id, { summary: calendar.summary, color: calendar.backgroundColor }]))
  } catch {
    return undefined
  }
}

const toExternalItem = (event: NormalizedGoogleEvent): DaySummaryItem => ({
  habitId: `gcal_${event.id}`,
  title: event.summary,
  description: event.description,
  category: 'schedule',
  frequency: 'none',
  startDate: event.date,
  allDay: event.allDay,
  startTime: event.startTime,
  endTime: event.endTime,
  completed: false,
  readOnly: true,
  calendarId: event.calendarId,
  calendarName: event.calendarName,
  calendarColor: event.calendarColor
})

const groupItemsByDate = (events: NormalizedGoogleEvent[], startDate: string, endDate: string): Map<string, DaySummaryItem[]> => {
  return events
    .filter((event) => event.date >= startDate && event.date <= endDate)
    .reduce((itemsByDate, event) => itemsByDate.set(event.date, [...(itemsByDate.get(event.date) || []), toExternalItem(event)]), new Map<string, DaySummaryItem[]>())
}

const fetchExternalCalendarItems = async (userId: string, startDate: string, endDate: string): Promise<Map<string, DaySummaryItem[]>> => {
  try {
    const user = await userRepository.findWithGoogleCalendarRefreshToken(userId)
    const googleCalendar = user?.integrations?.googleCalendar
    const refreshToken = googleCalendar?.refreshToken
    const selectedIds = googleCalendar?.selectedCalendarIds || []

    if (!googleCalendar?.connected || !refreshToken || selectedIds.length === 0) return new Map()

    const externalIds = selectedIds.filter((calendarId) => calendarId !== googleCalendar.calendarId)
    if (externalIds.length === 0) return new Map()

    const calendarMetaMap = await loadCalendarMetaMap(userId, refreshToken)

    const events = await getCachedGoogleCalendarEvents({
      userId,
      refreshToken,
      calendarIds: externalIds,
      timeMin: addDays(parseDateKey(startDate), -1).toISOString(),
      timeMax: addDays(parseDateKey(endDate), 2).toISOString(),
      calendarMetaMap
    })

    return groupItemsByDate(events, startDate, endDate)
  } catch (error) {
    logger.warn('Failed to load external google calendar events:', error)
    return new Map()
  }
}

const buildDaySummary = (date: string, activeHabits: HabitModelType[], getCompletion: (habitId: string) => boolean | undefined, externalItems: DaySummaryItem[]): DaySummaryResponse => {
  const items: DaySummaryItem[] = activeHabits
    .filter((habit) => getCompletion(habit.id.toString()) !== undefined || isHabitScheduledForDate(habit, date))
    .map((habit) => {
      const habitId = habit.id.toString()

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
        completed: getCompletion(habitId) ?? false
      }
    })
    .sort(sortByTime)

  const totalHabits = items.length
  const completedHabits = items.filter((item) => item.completed).length
  const completionRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0

  return {
    date,
    totalHabits,
    completedHabits,
    completionRate,
    items: [...items, ...externalItems].sort(sortByTime)
  }
}

export const toggleCheckinAction = defineAction<{ body: ToggleCheckinBody }>(
  {
    method: 'post',
    path: '/habits/checkins/toggle',
    summary: 'Marca ou desmarca a conclusão de uma meta/hábito para uma data',
    tags: ['Habits'],
    authenticate: true,
    schema: { body: toggleCheckinBodySchema },
    responses: {
      200: { description: 'Status de conclusão do hábito atualizado', schema: toggleCheckinResponseSchema },
      404: { description: 'Hábito não localizado' }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, data, manageError }): Promise<ToggleCheckinResponse | void> => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { habitId, date, completed } = data
    if (!isValidObjectId(habitId)) return manageError({ code: 'bad_request' })

    const habit = await habitRepository.findByIdAndUser(habitId, ids.userId)
    if (!habit) return manageError({ code: 'not_found' })

    const targetDate = date || formatDateKey(new Date())
    const existingCheckin = await habitCheckinRepository.findByUserHabitAndDate(ids.userId, habitId, targetDate)
    const nextCompleted = typeof completed === 'boolean' ? completed : !existingCheckin?.completed

    await habitCheckinRepository.upsertCheckin({ userId: ids.userId, habitId, date: targetDate, completed: nextCompleted })

    await createAuditLog({
      actorId: ids.userId,
      action: 'toggle_habit_checkin',
      entity: 'HabitCheckin',
      entityId: habitId,
      summary: 'Status do hábito modificado para a data.',
      details: { habitId, date: targetDate, completed: nextCompleted }
    })

    return { habitId, date: targetDate, completed: nextCompleted }
  }
)

export const getDaySummaryAction = defineAction<{ query: DaySummaryQuery }>(
  {
    method: 'get',
    path: '/habits/day-summary',
    summary: 'Calcula o resumo diário e taxa de aproveitamento das metas na data',
    tags: ['Habits'],
    authenticate: true,
    schema: { query: daySummaryQuerySchema },
    responses: {
      200: { description: 'Resumo e índice de aproveitamento do dia', schema: daySummaryResponseSchema }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, query, manageError }): Promise<DaySummaryResponse | void> => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const targetDate = query.date || formatDateKey(new Date())

    const [activeHabits, checkins, externalItemsMap] = await Promise.all([
      habitRepository.findAllByUser(ids.userId, { active: true }),
      habitCheckinRepository.findByUserAndDate(ids.userId, targetDate),
      fetchExternalCalendarItems(ids.userId, targetDate, targetDate)
    ])

    const checkinMap = new Map(checkins.map((checkin) => [checkin.habitId.toString(), checkin.completed]))

    return buildDaySummary(targetDate, activeHabits, (habitId) => checkinMap.get(habitId), externalItemsMap.get(targetDate) || [])
  }
)

export const getRangeSummaryAction = defineAction<{ query: RangeSummaryQuery }>(
  {
    method: 'get',
    path: '/habits/range-summary',
    summary: 'Calcula o resumo diário e taxa de aproveitamento das metas para um intervalo de datas',
    tags: ['Habits'],
    authenticate: true,
    schema: { query: rangeSummaryQuerySchema },
    responses: {
      200: { description: 'Lista de resumos e aproveitamentos no intervalo', schema: rangeSummaryResponseSchema }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, query, manageError }): Promise<RangeSummaryResponse | void> => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { startDate, endDate } = query

    const [activeHabits, checkins, externalItemsMap] = await Promise.all([
      habitRepository.findAllByUser(ids.userId, { active: true }),
      habitCheckinRepository.findByUserAndDateRange(ids.userId, startDate, endDate),
      fetchExternalCalendarItems(ids.userId, startDate, endDate)
    ])

    const checkinsByDateAndHabit = new Map(checkins.map((checkin) => [`${checkin.date}_${checkin.habitId.toString()}`, checkin.completed]))

    return listDateKeysInRange(startDate, endDate).map((dateKey) =>
      buildDaySummary(dateKey, activeHabits, (habitId) => checkinsByDateAndHabit.get(`${dateKey}_${habitId}`), externalItemsMap.get(dateKey) || [])
    )
  }
)
