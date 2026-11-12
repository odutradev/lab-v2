import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '@google/utils'
import { formatDateKey, parseDateKey, addDays, minsToTime } from '@utils/date'
import habitRepository from '@domains/habits/repositories/habit'
import userRepository from '@domains/users/repositories/user'
import { invalidateUserGoogleEvents } from '@google/cache'
import createLocalLogger from '@utils/localLogger'

import type { HabitModelType } from '@domains/habits/repositories/habit/types'
import type { GoogleCalendarEventInput } from '@google/types'

const logger = createLocalLogger('google-sync')

const RecurrenceDayCodes = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

type GoogleIntegration = { refreshToken: string; calendarId: string }

const getNextDateKey = (dateKey: string): string => formatDateKey(addDays(parseDateKey(dateKey), 1))

const getErrorStatus = (error: unknown): number | undefined => {
  const errorWithStatus = error as { status?: number; code?: number }
  return errorWithStatus?.status || errorWithStatus?.code
}

const resolveFrequency = (habit: HabitModelType): string => {
  const recurrence = habit.recurrence
  const type = recurrence?.type || habit.frequency

  if (type === 'weekly' || (type === 'custom' && recurrence?.unit === 'week')) return 'WEEKLY'
  if (type === 'monthly' || (type === 'custom' && recurrence?.unit === 'month')) return 'MONTHLY'
  if (type === 'yearly' || (type === 'custom' && recurrence?.unit === 'year')) return 'YEARLY'
  return 'DAILY'
}

const buildWeekDaysPart = (habit: HabitModelType): string[] => {
  const recurrence = habit.recurrence
  const fallbackDays = habit.startDate ? [new Date(habit.startDate + 'T00:00:00').getDay()] : []
  const rawDays = Array.isArray(recurrence?.daysOfWeek) && recurrence.daysOfWeek.length > 0 ? recurrence.daysOfWeek : fallbackDays
  const dayCodes = rawDays
    .filter((dayIndex) => dayIndex >= 0 && dayIndex <= 6)
    .map((dayIndex) => RecurrenceDayCodes[dayIndex])
    .join(',')

  return dayCodes ? [`BYDAY=${dayCodes}`] : []
}

const buildEndPart = (habit: HabitModelType): string[] => {
  const recurrence = habit.recurrence

  if (recurrence?.endType === 'on_date' && recurrence.endDate) return [`UNTIL=${recurrence.endDate.replace(/-/g, '')}T235959Z`]
  if (recurrence?.endType === 'after_occurrences' && recurrence.occurrences) return [`COUNT=${recurrence.occurrences}`]
  return []
}

const buildRecurrenceRule = (habit: HabitModelType): string[] | undefined => {
  const type = habit.recurrence?.type || habit.frequency

  if (!type || type === 'none') return undefined

  const frequency = resolveFrequency(habit)
  const interval = Math.max(1, habit.recurrence?.interval || 1)

  const parts = [
    `RRULE:FREQ=${frequency}`,
    ...(interval > 1 ? [`INTERVAL=${interval}`] : []),
    ...(frequency === 'WEEKLY' ? buildWeekDaysPart(habit) : []),
    ...buildEndPart(habit)
  ]

  return [parts.join(';')]
}

const resolveEndTime = (startTime: string, endTime?: string | null): string => {
  if (endTime && endTime.trim()) return endTime.trim()

  const [startHour, startMinute] = startTime.split(':').map(Number)

  return minsToTime(((startHour + 1) % 24) * 60 + startMinute)
}

export const formatHabitToGoogleEvent = (habit: HabitModelType): GoogleCalendarEventInput => {
  const startDate = habit.startDate || formatDateKey(new Date())
  const timeZone = process.env.TIMEZONE || 'America/Sao_Paulo'
  const startTime = habit.startTime?.trim() || ''
  const hasStartTime = Boolean(startTime)
  const isAllDay = habit.allDay !== undefined ? habit.allDay : !hasStartTime
  const recurrence = buildRecurrenceRule(habit)

  const baseEvent = { summary: habit.title, description: habit.description || undefined, recurrence }

  if (isAllDay || !hasStartTime) return { ...baseEvent, start: { date: startDate }, end: { date: getNextDateKey(startDate) } }

  return {
    ...baseEvent,
    start: { dateTime: `${startDate}T${startTime}:00`, timeZone },
    end: { dateTime: `${startDate}T${resolveEndTime(startTime, habit.endTime)}:00`, timeZone }
  }
}

const findGoogleIntegration = async (userId: string): Promise<GoogleIntegration | null> => {
  const user = await userRepository.findWithGoogleCalendarRefreshToken(userId)
  const integration = user?.integrations?.googleCalendar

  if (!integration?.connected || !integration.refreshToken || !integration.calendarId) return null

  return { refreshToken: integration.refreshToken, calendarId: integration.calendarId }
}

const tryUpdateExistingEvent = async (integration: GoogleIntegration, habit: HabitModelType, eventPayload: GoogleCalendarEventInput): Promise<boolean> => {
  if (!habit.googleEventId) return false

  try {
    await updateCalendarEvent(integration.refreshToken, integration.calendarId, habit.googleEventId, eventPayload)
    return true
  } catch (error: unknown) {
    const status = getErrorStatus(error)
    if (status !== 404 && status !== 410) logger.warn(`Failed to update Google event "${habit.googleEventId}", attempting recreate:`, error)
    return false
  }
}

const createAndLinkEvent = async (integration: GoogleIntegration, userId: string, habit: HabitModelType, eventPayload: GoogleCalendarEventInput): Promise<string | null> => {
  const newEventId = await createCalendarEvent(integration.refreshToken, eventPayload, integration.calendarId)

  if (newEventId) await habitRepository.update(habit.id, userId, { googleEventId: newEventId })

  return newEventId
}

export const syncHabitToGoogle = async (userId: string, habit: HabitModelType): Promise<string | null> => {
  try {
    const integration = await findGoogleIntegration(userId)
    if (!integration) return null

    const eventPayload = formatHabitToGoogleEvent(habit)
    const isUpdated = await tryUpdateExistingEvent(integration, habit, eventPayload)

    if (isUpdated) {
      await invalidateUserGoogleEvents(userId)
      return habit.googleEventId as string
    }

    const newEventId = await createAndLinkEvent(integration, userId, habit, eventPayload)

    await invalidateUserGoogleEvents(userId)
    return newEventId
  } catch (error) {
    logger.error(`Error syncing habit "${habit.id}" to Google Calendar:`, error)
    return null
  }
}

export const removeHabitFromGoogle = async (userId: string, googleEventId?: string | null): Promise<boolean> => {
  if (!googleEventId) return false

  try {
    const integration = await findGoogleIntegration(userId)
    if (!integration) return false

    const isDeleted = await deleteCalendarEvent(integration.refreshToken, integration.calendarId, googleEventId)
    if (isDeleted) await invalidateUserGoogleEvents(userId)

    return isDeleted
  } catch (error) {
    logger.error(`Error deleting Google event "${googleEventId}":`, error)
    return false
  }
}

const syncHabitDuringBulk = async (integration: GoogleIntegration, userId: string, habit: HabitModelType): Promise<boolean> => {
  const eventPayload = formatHabitToGoogleEvent(habit)

  try {
    const isUpdated = habit.googleEventId
      ? await updateCalendarEvent(integration.refreshToken, integration.calendarId, habit.googleEventId, eventPayload).then(() => true, () => false)
      : false

    if (isUpdated) return true

    const newEventId = await createAndLinkEvent(integration, userId, habit, eventPayload)
    return Boolean(newEventId)
  } catch (error) {
    logger.warn(`Failed to sync habit "${habit.id}" during bulk sync:`, error)
    return false
  }
}

export const syncAllUserHabitsToGoogle = async (userId: string): Promise<number> => {
  try {
    const integration = await findGoogleIntegration(userId)
    if (!integration) return 0

    const habits = await habitRepository.findAllByUser(userId, { active: true })

    const syncedCount = await habits.reduce<Promise<number>>(async (previousCount, habit) => {
      const count = await previousCount
      const isSynced = await syncHabitDuringBulk(integration, userId, habit)
      return isSynced ? count + 1 : count
    }, Promise.resolve(0))

    logger.info(`Successfully bulk-synced ${syncedCount} habits to Google Calendar for user "${userId}"`)
    if (syncedCount > 0) await invalidateUserGoogleEvents(userId)

    return syncedCount
  } catch (error) {
    logger.error(`Error in syncAllUserHabitsToGoogle for user "${userId}":`, error)
    return 0
  }
}
