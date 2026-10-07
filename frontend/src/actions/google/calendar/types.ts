export interface GoogleCalendarStatusResponse {
  connected: boolean
  email?: string
  connectedAt?: string
}

export interface GoogleCalendarAuthUrlResponse {
  url: string
}

export interface DisconnectGoogleCalendarResponse {
  success: boolean
  message: string
}
