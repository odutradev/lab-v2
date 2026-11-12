import type { GoogleCalendarStatusResponse } from '@actions/google/calendar/types'

export interface ProfileProgressCardProps {
  calendarStatus?: GoogleCalendarStatusResponse
  onConnectCalendar?: () => void
}
