import apiClient from '@api/client'

import type {
  GoogleCalendarAuthUrlResponse,
  GoogleCalendarStatusResponse,
  DisconnectGoogleCalendarResponse
} from './types'

export const getGoogleCalendarAuthUrlAction = async (): Promise<GoogleCalendarAuthUrlResponse> => {
  return apiClient.get<GoogleCalendarAuthUrlResponse>('/google/calendar/auth-url')
}

export const getGoogleCalendarStatusAction = async (): Promise<GoogleCalendarStatusResponse> => {
  return apiClient.get<GoogleCalendarStatusResponse>('/google/calendar/status')
}

export const disconnectGoogleCalendarAction = async (): Promise<DisconnectGoogleCalendarResponse> => {
  return apiClient.post<DisconnectGoogleCalendarResponse>('/google/calendar/disconnect')
}
