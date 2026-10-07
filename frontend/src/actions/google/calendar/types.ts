export interface GoogleCalendarStatusResponse {
  connected: boolean
  email?: string
  calendarId?: string
  calendarName?: string
  calendarUrl?: string
  connectedAt?: string
}

export interface GoogleCalendarAuthUrlResponse {
  url: string
}

export interface DisconnectGoogleCalendarPayload {
  deleteCalendar?: boolean
}

export interface DisconnectGoogleCalendarResponse {
  success: boolean
  message: string
}

export interface UpdateGoogleCalendarNamePayload {
  name: string
}

export interface UpdateGoogleCalendarNameResponse {
  success: boolean
  calendarName: string
  message: string
}

