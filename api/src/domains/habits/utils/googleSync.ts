import userRepository from '@domains/users/repositories/user'
import habitRepository from '@domains/habits/repositories/habit'
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
} from '@google/utils'
import createLocalLogger from '@utils/localLogger'

import type { GoogleCalendarEventInput } from '@google/types'
import type { HabitModelType } from '@domains/habits/repositories/habit/types'

const logger = createLocalLogger('google-sync')

const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

const getNextDateString = (dateStr: string): string => {
  const [y, m, d] = dateStr.split('-').map(Number)
  const next = new Date(y, m - 1, d + 1)
  const yyyy = next.getFullYear()
  const mm = String(next.getMonth() + 1).padStart(2, '0')
  const dd = String(next.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const buildRecurrenceRule = (habit: HabitModelType): string[] | undefined => {
  const rec = habit.recurrence
  const type = rec?.type || habit.frequency

  if (!type || type === 'none') return undefined

  let freq = 'DAILY'
  if (type === 'weekly' || (type === 'custom' && rec?.unit === 'week')) {
    freq = 'WEEKLY'
  } else if (type === 'monthly' || (type === 'custom' && rec?.unit === 'month')) {
    freq = 'MONTHLY'
  }

  const parts = [`RRULE:FREQ=${freq}`]
  const interval = Math.max(1, rec?.interval || 1)
  if (interval > 1) {
    parts.push(`INTERVAL=${interval}`)
  }

  if (freq === 'WEEKLY') {
    const rawDays = Array.isArray(rec?.daysOfWeek) && rec.daysOfWeek.length > 0
      ? rec.daysOfWeek
      : habit.startDate
        ? [new Date(habit.startDate + 'T00:00:00').getDay()]
        : []

    if (rawDays.length > 0) {
      const days = rawDays
        .filter((d) => d >= 0 && d <= 6)
        .map((d) => dayMap[d])
        .join(',')
      if (days) parts.push(`BYDAY=${days}`)
    }
  }

  if (rec?.endType === 'on_date' && rec.endDate) {
    const cleanEnd = rec.endDate.replace(/-/g, '')
    parts.push(`UNTIL=${cleanEnd}T235959Z`)
  } else if (rec?.endType === 'after_occurrences' && rec.occurrences) {
    parts.push(`COUNT=${rec.occurrences}`)
  }

  return [parts.join(';')]
}

export const formatHabitToGoogleEvent = (habit: HabitModelType): GoogleCalendarEventInput => {
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const startDate = habit.startDate || todayStr
  const timeZone = process.env.TIMEZONE || 'America/Sao_Paulo'

  const hasStartTime = Boolean(habit.startTime && habit.startTime.trim())
  const isAllDay = habit.allDay !== undefined ? habit.allDay : !hasStartTime

  let start: GoogleCalendarEventInput['start']
  let end: GoogleCalendarEventInput['end']

  if (isAllDay || !hasStartTime) {
    start = { date: startDate }
    end = { date: getNextDateString(startDate) }
  } else {
    const startTime = habit.startTime!.trim()
    const [startH, startM] = startTime.split(':').map(Number)
    let endTime = habit.endTime && habit.endTime.trim() ? habit.endTime.trim() : null
    if (!endTime) {
      const endH = (startH + 1) % 24
      endTime = `${String(endH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`
    }

    start = {
      dateTime: `${startDate}T${startTime}:00`,
      timeZone
    }
    end = {
      dateTime: `${startDate}T${endTime}:00`,
      timeZone
    }
  }

  const recurrence = buildRecurrenceRule(habit)

  return {
    summary: habit.title,
    description: habit.description || undefined,
    start,
    end,
    recurrence
  }
}

export const syncHabitToGoogle = async (
  userId: string,
  habit: HabitModelType
): Promise<string | null> => {
  try {
    const user = await userRepository.findWithGoogleCalendarRefreshToken(userId)
    const integration = user?.integrations?.googleCalendar
    if (!integration?.connected || !integration.refreshToken || !integration.calendarId) {
      return null
    }

    const eventPayload = formatHabitToGoogleEvent(habit)

    if (habit.googleEventId) {
      try {
        await updateCalendarEvent(
          integration.refreshToken,
          integration.calendarId,
          habit.googleEventId,
          eventPayload
        )
        return habit.googleEventId
      } catch (err: unknown) {
        const status = (err as { status?: number; code?: number })?.status || (err as { status?: number; code?: number })?.code
        if (status !== 404 && status !== 410) {
          logger.warn(`Failed to update Google event "${habit.googleEventId}", attempting recreate:`, err)
        }
      }
    }

    const newEventId = await createCalendarEvent(
      integration.refreshToken,
      eventPayload,
      integration.calendarId
    )

    if (newEventId) {
      await habitRepository.update(habit.id, userId, {
        googleEventId: newEventId
      })
    }

    return newEventId
  } catch (error) {
    logger.error(`Error syncing habit "${habit.id}" to Google Calendar:`, error)
    return null
  }
}

export const removeHabitFromGoogle = async (
  userId: string,
  googleEventId?: string | null
): Promise<boolean> => {
  if (!googleEventId) return false
  try {
    const user = await userRepository.findWithGoogleCalendarRefreshToken(userId)
    const integration = user?.integrations?.googleCalendar
    if (!integration?.connected || !integration.refreshToken || !integration.calendarId) {
      return false
    }

    return await deleteCalendarEvent(
      integration.refreshToken,
      integration.calendarId,
      googleEventId
    )
  } catch (error) {
    logger.error(`Error deleting Google event "${googleEventId}":`, error)
    return false
  }
}

export const syncAllUserHabitsToGoogle = async (userId: string): Promise<number> => {
  try {
    const user = await userRepository.findWithGoogleCalendarRefreshToken(userId)
    const integration = user?.integrations?.googleCalendar
    if (!integration?.connected || !integration.refreshToken || !integration.calendarId) {
      return 0
    }

    const habits = await habitRepository.findAllByUser(userId, { active: true })
    let syncedCount = 0

    for (const habit of habits) {
      const eventPayload = formatHabitToGoogleEvent(habit)
      try {
        let eventId = habit.googleEventId
        if (eventId) {
          try {
            await updateCalendarEvent(
              integration.refreshToken,
              integration.calendarId,
              eventId,
              eventPayload
            )
            syncedCount++
            continue
          } catch {
            // Recria evento caso não exista mais no Google
          }
        }

        const newId = await createCalendarEvent(
          integration.refreshToken,
          eventPayload,
          integration.calendarId
        )
        if (newId) {
          await habitRepository.update(habit.id, userId, { googleEventId: newId })
          syncedCount++
        }
      } catch (err) {
        logger.warn(`Failed to sync habit "${habit.id}" during bulk sync:`, err)
      }
    }

    logger.info(`Successfully bulk-synced ${syncedCount} habits to Google Calendar for user "${userId}"`)
    return syncedCount
  } catch (error) {
    logger.error(`Error in syncAllUserHabitsToGoogle for user "${userId}":`, error)
    return 0
  }
}
