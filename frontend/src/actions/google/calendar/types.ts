export interface GoogleCalendarStatusResponse {
  connected: boolean
  email?: string
  calendarId?: string
  connectedAt?: string
}

export interface GoogleCalendarAuthUrlResponse {
  url: string
}

export interface DisconnectGoogleCalendarResponse {
  success: boolean
  message: string
}
