import { google } from 'googleapis'

import { formatDateKey, formatTimeKey, parseDateKey, addDays, countDaysBetween } from '@utils/date'
import createLocalLogger from '@utils/localLogger'
import googleService from '@google/connect'

import type { GoogleAuthTokens, GoogleCalendarEventInput, GoogleCalendarInstance, GoogleCalendarListItem, NormalizedGoogleEvent } from '@google/types'
import type { Auth, calendar_v3 } from 'googleapis'

const logger = createLocalLogger('google-utils')

const DefaultScopes = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'openid'
]

export const generateGoogleAuthUrl = (options?: { state?: string; scopes?: string[] }): string => {
  const client = googleService.getInstance()
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: options?.scopes || DefaultScopes,
    state: options?.state
  })
}

export const exchangeCodeForTokens = async (code: string): Promise<GoogleAuthTokens> => {
  const client = googleService.getInstance()
  const { tokens } = await client.getToken(code)
  return tokens
}

export const createAuthenticatedClient = (refreshToken: string): Auth.OAuth2Client => {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
  client.setCredentials({ refresh_token: refreshToken })
  return client
}

export const createGoogleCalendarClient = (refreshToken: string): GoogleCalendarInstance => {
  const auth = createAuthenticatedClient(refreshToken)
  return google.calendar({ version: 'v3', auth })
}

export const fetchGoogleUserEmail = async (auth: Auth.OAuth2Client): Promise<string | undefined> => {
  try {
    const oauth2 = google.oauth2({ version: 'v2', auth })
    const { data } = await oauth2.userinfo.get()
    return data.email || undefined
  } catch (error) {
    logger.error('Failed to fetch Google user email:', error)
    return undefined
  }
}

export const revokeGoogleToken = async (token: string): Promise<boolean> => {
  try {
    const client = googleService.getInstance()
    await client.revokeToken(token)
    logger.info('Google token revoked successfully')
    return true
  } catch (error) {
    logger.error('Error revoking Google token:', error)
    return false
  }
}

export interface GoogleCalendarDetails {
  id: string
  summary: string
}

const findCalendarBySummary = async (
  calendar: GoogleCalendarInstance,
  normalizedTarget: string,
  pageToken?: string
): Promise<GoogleCalendarDetails | null> => {
  const listResponse = await calendar.calendarList.list({ pageToken, maxResults: 100 })
  const items = listResponse.data.items || []
  const existingCalendar = items.find((item) => !!item.summary && !item.deleted && item.summary.trim().toLowerCase() === normalizedTarget)

  if (existingCalendar?.id && existingCalendar.summary) return { id: existingCalendar.id, summary: existingCalendar.summary }

  const nextPageToken = listResponse.data.nextPageToken || undefined

  if (!nextPageToken) return null

  return findCalendarBySummary(calendar, normalizedTarget, nextPageToken)
}

export const getOrCreateLabCalendar = async (
  refreshToken: string,
  summary: string = 'Lab V2'
): Promise<GoogleCalendarDetails> => {
  try {
    const calendar = createGoogleCalendarClient(refreshToken)
    const existingCalendar = await findCalendarBySummary(calendar, summary.trim().toLowerCase())

    if (existingCalendar) {
      logger.info(`Found existing Google Calendar "${existingCalendar.summary}" with id: ${existingCalendar.id}`)
      return existingCalendar
    }

    const created = await calendar.calendars.insert({
      requestBody: {
        summary,
        description: 'Agenda sincronizada do Lab V2'
      }
    })

    if (!created.data.id) {
      throw new Error(`Failed to retrieve id for newly created Google Calendar "${summary}"`)
    }

    const createdSummary = created.data.summary || summary
    logger.info(`Created new Google Calendar "${createdSummary}" with id: ${created.data.id}`)
    return {
      id: created.data.id,
      summary: createdSummary
    }
  } catch (error) {
    logger.error(`Error finding or creating Google Calendar "${summary}":`, error)
    throw error
  }
}

export const updateGoogleCalendarSummary = async (
  refreshToken: string,
  calendarId: string,
  summary: string
): Promise<string> => {
  try {
    const calendar = createGoogleCalendarClient(refreshToken)
    try {
      const response = await calendar.calendars.patch({
        calendarId,
        requestBody: {
          summary
        }
      })
      const updatedSummary = response.data.summary || summary
      logger.info(`Google Calendar "${calendarId}" renamed via calendars.patch to "${updatedSummary}"`)
      return updatedSummary
    } catch (patchError) {
      logger.warn(`calendars.patch failed for "${calendarId}", attempting calendarList.patch:`, patchError)
      const listResponse = await calendar.calendarList.patch({
        calendarId,
        requestBody: {
          summary
        }
      })
      const updatedSummary = listResponse.data.summary || summary
      logger.info(`Google Calendar "${calendarId}" renamed via calendarList.patch to "${updatedSummary}"`)
      return updatedSummary
    }
  } catch (error) {
    logger.error(`Error renaming Google Calendar "${calendarId}":`, error)
    throw error
  }
}

export interface CalendarSyncStatus {
  exists: boolean
  summary?: string
}

export const checkGoogleCalendarStatus = async (
  refreshToken: string,
  calendarId: string
): Promise<CalendarSyncStatus> => {
  try {
    const calendar = createGoogleCalendarClient(refreshToken)

    try {
      const response = await calendar.calendars.get({ calendarId })
      return {
        exists: true,
        summary: response.data.summary || undefined
      }
    } catch (calendarError: unknown) {
      const status = (calendarError as { status?: number; code?: number })?.status || (calendarError as { status?: number; code?: number })?.code
      if (status === 404) {
        return { exists: false }
      }

      const listResponse = await calendar.calendarList.get({ calendarId })
      if (listResponse.data.deleted) {
        return { exists: false }
      }

      return {
        exists: true,
        summary: listResponse.data.summary || undefined
      }
    }
  } catch (error: unknown) {
    const status = (error as { status?: number; code?: number })?.status || (error as { status?: number; code?: number })?.code
    if (status === 404) {
      return { exists: false }
    }
    logger.warn(`Could not verify Google Calendar status for "${calendarId}":`, error)
    return { exists: true }
  }
}

export const deleteGoogleCalendar = async (
  refreshToken: string,
  calendarId: string
): Promise<boolean> => {
  try {
    const calendar = createGoogleCalendarClient(refreshToken)
    await calendar.calendars.delete({ calendarId })
    logger.info(`Google Calendar "${calendarId}" deleted successfully`)
    return true
  } catch (error) {
    logger.error(`Error deleting Google Calendar "${calendarId}":`, error)
    return false
  }
}

export const createCalendarEvent = async (
  refreshToken: string,
  event: GoogleCalendarEventInput,
  calendarId: string = 'primary'
): Promise<string | null> => {
  try {
    const calendar = createGoogleCalendarClient(refreshToken)
    const response = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: event.start,
        end: event.end,
        recurrence: event.recurrence
      }
    })
    return response.data.id || null
  } catch (error) {
    logger.error('Failed to create calendar event:', error)
    throw error
  }
}

export const updateCalendarEvent = async (
  refreshToken: string,
  calendarId: string,
  eventId: string,
  event: GoogleCalendarEventInput
): Promise<string | null> => {
  try {
    const calendar = createGoogleCalendarClient(refreshToken)
    const response = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: event.start,
        end: event.end,
        recurrence: event.recurrence
      }
    })
    return response.data.id || null
  } catch (error) {
    logger.error(`Failed to update calendar event "${eventId}":`, error)
    throw error
  }
}

export const deleteCalendarEvent = async (
  refreshToken: string,
  calendarId: string,
  eventId: string
): Promise<boolean> => {
  try {
    const calendar = createGoogleCalendarClient(refreshToken)
    await calendar.events.delete({
      calendarId,
      eventId
    })
    return true
  } catch (error: unknown) {
    const status = (error as { status?: number; code?: number })?.status || (error as { status?: number; code?: number })?.code
    if (status === 404 || status === 410) {
      return true
    }
    logger.error(`Failed to delete calendar event "${eventId}":`, error)
    return false
  }
}

export const listUserGoogleCalendars = async (
  refreshToken: string
): Promise<GoogleCalendarListItem[]> => {
  try {
    const calendar = createGoogleCalendarClient(refreshToken)
    const response = await calendar.calendarList.list({ maxResults: 250 })
    const items = response.data.items || []

    return items
      .filter((item) => item.id && !item.deleted)
      .map((item) => ({
        id: item.id as string,
        summary: item.summaryOverride || item.summary || 'Sem título',
        description: item.description || undefined,
        primary: !!item.primary,
        backgroundColor: item.backgroundColor || undefined,
        foregroundColor: item.foregroundColor || undefined,
        accessRole: item.accessRole || undefined
      }))
  } catch (error) {
    logger.error('Error listing user Google Calendars:', error)
    throw error
  }
}

const parseEventDateTime = (dateTime?: string | null): { date: string; time: string | null } => {
  if (!dateTime) return { date: '', time: null }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateTime)) return { date: dateTime, time: null }

  const match = dateTime.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/)
  if (match) return { date: match[1], time: match[2] }

  const parsedDate = new Date(dateTime)
  if (isNaN(parsedDate.getTime())) return { date: '', time: null }

  return { date: formatDateKey(parsedDate), time: formatTimeKey(parsedDate) }
}

type CalendarEventEntry = {
  event: calendar_v3.Schema$Event
  calendarId: string
  calendarName?: string
  calendarColor?: string
}

const listDateKeysBetween = (startDate: string, endDate: string): string[] => {
  const firstDay = parseDateKey(startDate)
  const totalDays = countDaysBetween(firstDay, parseDateKey(endDate))
  return Array.from({ length: Math.max(totalDays, 0) }, (_, index) => formatDateKey(addDays(firstDay, index)))
}

const normalizeCalendarEvent = ({ event, calendarId, calendarName, calendarColor }: CalendarEventEntry): NormalizedGoogleEvent[] => {
  if (!event.id || event.status === 'cancelled') return []

  const isAllDay = Boolean(event.start?.date)
  const { date: startDate, time: startTime } = parseEventDateTime(event.start?.dateTime || event.start?.date)
  const { date: endDate, time: endTime } = parseEventDateTime(event.end?.dateTime || event.end?.date)

  if (!startDate) return []

  const baseEvent = {
    calendarId,
    calendarName,
    calendarColor,
    summary: event.summary || '(Sem título)',
    description: event.description || undefined
  }

  if (isAllDay && endDate && endDate > startDate) {
    return listDateKeysBetween(startDate, endDate).map((dayKey) => ({
      ...baseEvent,
      id: `${event.id}_${dayKey}`,
      allDay: true,
      date: dayKey,
      startTime: null,
      endTime: null
    }))
  }

  return [{ ...baseEvent, id: event.id, allDay: isAllDay, date: startDate, startTime, endTime }]
}

export const fetchGoogleCalendarEvents = async (
  refreshToken: string,
  calendarIds: string[],
  timeMin: string,
  timeMax: string,
  calendarMetaMap?: Map<string, { summary: string; color?: string }>
): Promise<NormalizedGoogleEvent[]> => {
  if (!calendarIds.length) return []

  try {
    const calendar = createGoogleCalendarClient(refreshToken)
    const results = await Promise.allSettled(
      calendarIds.map(async (calendarId) => {
        const response = await calendar.events.list({
          calendarId,
          timeMin,
          timeMax,
          timeZone: 'America/Sao_Paulo',
          singleEvents: true,
          orderBy: 'startTime',
          maxResults: 250
        })
        const calendarMeta = calendarMetaMap?.get(calendarId)
        return (response.data.items || []).map((event) => ({
          event,
          calendarId,
          calendarName: calendarMeta?.summary,
          calendarColor: calendarMeta?.color
        }))
      })
    )

    return results.flatMap((result) => {
      if (result.status === 'fulfilled') return result.value.flatMap(normalizeCalendarEvent)
      logger.warn('Failed to fetch events for a calendar:', result.reason)
      return []
    })
  } catch (error) {
    logger.error('Error fetching Google calendar events:', error)
    return []
  }
}

