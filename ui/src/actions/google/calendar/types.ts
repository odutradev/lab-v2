export interface GoogleCalendarStatusResponse {
  connected: boolean
  email?: string
  calendarId?: string
  calendarName?: string
  calendarUrl?: string
  calendarDeleted?: boolean
  connectedAt?: string
}

export interface RecreateGoogleCalendarResponse {
  success: boolean
  calendarId: string
  calendarName: string
  calendarUrl: string
  message: string
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

export interface GoogleCalendarItem {
  id: string
  summary: string
  description?: string
  primary?: boolean
  backgroundColor?: string
  foregroundColor?: string
  accessRole?: string
  isLabV2: boolean
  selected: boolean
}

export interface ListGoogleCalendarsResponse {
  connected: boolean
  items: GoogleCalendarItem[]
  selectedCalendarIds: string[]
}

export interface UpdateSelectedGoogleCalendarsPayload {
  calendarIds: string[]
}

export interface UpdateSelectedGoogleCalendarsResponse {
  success: boolean
  selectedCalendarIds: string[]
  message: string
}

