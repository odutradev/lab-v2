import { google } from 'googleapis'

import googleService from '@google/connect'
import createLocalLogger from '@utils/localLogger'

import type { GoogleAuthTokens, GoogleCalendarEventInput, GoogleCalendarInstance } from '@google/types'
import type { Auth } from 'googleapis'

const logger = createLocalLogger('google-utils')

const DEFAULT_SCOPES = [
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
    scope: options?.scopes || DEFAULT_SCOPES,
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

export const getOrCreateLabCalendar = async (
  refreshToken: string,
  summary: string = 'Lab V2'
): Promise<GoogleCalendarDetails> => {
  try {
    const calendar = createGoogleCalendarClient(refreshToken)
    const normalizedTarget = summary.trim().toLowerCase()
    let pageToken: string | undefined = undefined

    do {
      const listResponse = await calendar.calendarList.list({
        pageToken,
        maxResults: 100
      })

      const items = listResponse.data.items || []
      const existingCalendar = items.find((item) => {
        if (!item.summary || item.deleted) return false
        return item.summary.trim().toLowerCase() === normalizedTarget
      })

      if (existingCalendar?.id && existingCalendar.summary) {
        logger.info(`Found existing Google Calendar "${existingCalendar.summary}" with id: ${existingCalendar.id}`)
        return {
          id: existingCalendar.id,
          summary: existingCalendar.summary
        }
      }

      pageToken = listResponse.data.nextPageToken || undefined
    } while (pageToken)

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
    } catch (err: unknown) {
      const status = (err as { status?: number; code?: number })?.status || (err as { status?: number; code?: number })?.code
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
        end: event.end
      }
    })
    return response.data.id || null
  } catch (error) {
    logger.error('Failed to create calendar event:', error)
    throw error
  }
}
