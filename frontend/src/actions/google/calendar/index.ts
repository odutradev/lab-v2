import apiClient from '@api/client'

import type {
  GoogleCalendarAuthUrlResponse,
  GoogleCalendarStatusResponse,
  DisconnectGoogleCalendarPayload,
  DisconnectGoogleCalendarResponse,
  UpdateGoogleCalendarNamePayload,
  UpdateGoogleCalendarNameResponse
} from './types'

export const getGoogleCalendarAuthUrlAction = async (): Promise<GoogleCalendarAuthUrlResponse> => {
  return apiClient.get<GoogleCalendarAuthUrlResponse>('/google/calendar/auth-url')
}

export const getGoogleCalendarStatusAction = async (): Promise<GoogleCalendarStatusResponse> => {
  return apiClient.get<GoogleCalendarStatusResponse>('/google/calendar/status')
}

export const disconnectGoogleCalendarAction = async (
  payload?: DisconnectGoogleCalendarPayload
): Promise<DisconnectGoogleCalendarResponse> => {
  return apiClient.post<DisconnectGoogleCalendarResponse>('/google/calendar/disconnect', payload)
}

export const updateGoogleCalendarNameAction = async (
  payload: UpdateGoogleCalendarNamePayload
): Promise<UpdateGoogleCalendarNameResponse> => {
  return apiClient.patch<UpdateGoogleCalendarNameResponse>('/google/calendar/name', payload)
}

