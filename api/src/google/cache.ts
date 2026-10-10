import cacheService from '@cache'
import {
  listUserGoogleCalendars,
  fetchGoogleCalendarEvents
} from '@google/utils'
import createLocalLogger from '@utils/localLogger'

import type { GoogleCalendarListItem, NormalizedGoogleEvent } from '@google/types'

const logger = createLocalLogger('google-cache')

// TTLs em segundos
export const GCAL_CALENDARS_TTL = 900 // 15 minutos
export const GCAL_EVENTS_TTL = 300 // 5 minutos

const getCalendarsKey = (userId: string): string => `gcal:calendars:${userId}`

const getEventsKey = (userId: string, calendarIds: string[], timeMin: string, timeMax: string): string => {
  const sortedIds = calendarIds.slice().sort().join(',')
  // Normaliza o range para a precisão de data (YYYY-MM-DD) para maximizar reutilização de cache
  const minDateStr = timeMin.slice(0, 10)
  const maxDateStr = timeMax.slice(0, 10)
  return `gcal:events:${userId}:${sortedIds}:${minDateStr}_${maxDateStr}`
}

/**
 * Retorna as agendas do usuário do cache ou consulta a API do Google Calendar.
 */
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

/**
 * Retorna os eventos das agendas selecionadas do cache ou consulta a API do Google Calendar.
 * Protegido com deduplicação Single-Flight para evitar múltiplas requisições paralelas idênticas.
 */
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

/**
 * Invalida o cache de lista de agendas de um usuário.
 */
export const invalidateUserGoogleCalendars = async (userId: string): Promise<void> => {
  await cacheService.del(getCalendarsKey(userId))
}

/**
 * Invalida todo o cache de eventos de um usuário.
 */
export const invalidateUserGoogleEvents = async (userId: string): Promise<void> => {
  await cacheService.delPattern(`gcal:events:${userId}:*`)
}

/**
 * Invalida todo o cache associado ao Google Calendar de um usuário (agendas e eventos).
 */
export const invalidateAllUserGoogleCache = async (userId: string): Promise<void> => {
  await Promise.allSettled([
    invalidateUserGoogleCalendars(userId),
    invalidateUserGoogleEvents(userId)
  ])
}
