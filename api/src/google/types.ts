import type { Auth, calendar_v3 } from 'googleapis'

export interface GoogleModule {
  oauth2Client: Auth.OAuth2Client | null
  initializeGoogle: () => Auth.OAuth2Client
  getInstance: () => Auth.OAuth2Client
}

export interface GoogleAuthTokens {
  access_token?: string | null
  refresh_token?: string | null
  scope?: string | null
  token_type?: string | null
  id_token?: string | null
  expiry_date?: number | null
}

export interface GoogleCalendarEventInput {
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  end: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  recurrence?: string[]
}

export type GoogleCalendarInstance = calendar_v3.Calendar

export interface GoogleCalendarListItem {
  id: string
  summary: string
  description?: string
  primary?: boolean
  backgroundColor?: string
  foregroundColor?: string
  accessRole?: string
}

export interface NormalizedGoogleEvent {
  id: string
  calendarId: string
  calendarName?: string
  calendarColor?: string
  summary: string
  description?: string
  allDay: boolean
  date: string
  startTime?: string | null
  endTime?: string | null
}
