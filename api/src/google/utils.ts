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

export const getOrCreateLabCalendar = async (
  refreshToken: string,
  summary: string = 'Lab V2'
): Promise<string> => {
  try {
    const calendar = createGoogleCalendarClient(refreshToken)
    const listResponse = await calendar.calendarList.list()
    const existingCalendar = listResponse.data.items?.find((item) => item.summary === summary)

    if (existingCalendar?.id) {
      logger.info(`Found existing Google Calendar "${summary}" with id: ${existingCalendar.id}`)
      return existingCalendar.id
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

    logger.info(`Created new Google Calendar "${summary}" with id: ${created.data.id}`)
    return created.data.id
  } catch (error) {
    logger.error(`Error finding or creating Google Calendar "${summary}":`, error)
    throw error
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
