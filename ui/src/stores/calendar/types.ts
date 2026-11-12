import type { GoogleCalendarItem } from '@actions/google/calendar/types'

export interface CalendarStoreState {
  calendars: GoogleCalendarItem[]
  selectedCalendarIds: string[]
  isConnected: boolean
  isLoading: boolean
  isSaving: boolean
  isConnecting: boolean
  fetchCalendars: () => Promise<void>
  setSelectedCalendarIds: (ids: string[]) => void
  toggleCalendar: (id: string) => void
  saveSelectedCalendars: () => Promise<void>
  connectGoogle: () => Promise<void>
}
