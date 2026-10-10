import { listUserGoogleCalendars, fetchGoogleCalendarEvents } from '@google/utils'
import createLocalLogger from '@utils/localLogger'
import cacheService from '@cache'

import type { GoogleCalendarListItem, NormalizedGoogleEvent } from '@google/types'

const logger = createLocalLogger('google-cache')

export const GCAL_CALENDARS_TTL = 900
export const GCAL_EVENTS_TTL = 300

const getCalendarsKey = (userId: string): string => `gcal:calendars:${userId}`

const getEventsKey = (userId: string, calendarIds: string[], timeMin: string, timeMax: string): string => {
  const sortedIds = calendarIds.slice().sort().join(',')
  const minDateStr = timeMin.slice(0, 10)
  const maxDateStr = timeMax.slice(0, 10)
  return `gcal:events:${userId}:${sortedIds}:${minDateStr}_${maxDateStr}`
}

export const getCachedUserGoogleCalendars = async (
  userId: string,
  refreshToken: string
): Promise<GoogleCalendarListItem[]> => {
  const key = getCalendarsKey(userId)
  return cacheService.getOrSet(key, GCAL_CALENDARS_TTL, async () => {
    logger.info(`Fetching fresh Google Calendar list for user "${userId}"`)
    return listUserGoogleCalendars(refreshToken)
  })
}

export const getCachedGoogleCalendarEvents = async (options: {
  userId: string
  refreshToken: string
  calendarIds: string[]
  timeMin: string
  timeMax: string
  calendarMetaMap?: Map<string, { summary: string; color?: string }>
}): Promise<NormalizedGoogleEvent[]> => {
  const { userId, refreshToken, calendarIds, timeMin, timeMax, calendarMetaMap } = options
  if (!calendarIds.length) return []

  const key = getEventsKey(userId, calendarIds, timeMin, timeMax)

  return cacheService.getOrSet(key, GCAL_EVENTS_TTL, async () => {
    logger.info(`Fetching fresh Google Calendar events for user "${userId}" (${calendarIds.length} calendars)`)
    return fetchGoogleCalendarEvents(
      refreshToken,
      calendarIds,
      timeMin,
      timeMax,
      calendarMetaMap
    )
  })
}

export const invalidateUserGoogleCalendars = async (userId: string): Promise<void> => {
  await cacheService.del(getCalendarsKey(userId))
}

export const invalidateUserGoogleEvents = async (userId: string): Promise<void> => {
  await cacheService.delPattern(`gcal:events:${userId}:*`)
}

export const invalidateAllUserGoogleCache = async (userId: string): Promise<void> => {
  await Promise.allSettled([
    invalidateUserGoogleCalendars(userId),
    invalidateUserGoogleEvents(userId)
  ])
}
