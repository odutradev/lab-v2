import api from "@utils/api";

import type {
  GoogleCalendarAuthUrlResponse,
  GoogleCalendarStatusResponse,
  DisconnectGoogleCalendarPayload,
  DisconnectGoogleCalendarResponse,
  UpdateGoogleCalendarNamePayload,
  UpdateGoogleCalendarNameResponse,
  RecreateGoogleCalendarResponse,
  ListGoogleCalendarsResponse,
  UpdateSelectedGoogleCalendarsPayload,
  UpdateSelectedGoogleCalendarsResponse
} from "@actions/google/calendar/types";

export const getGoogleCalendarAuthUrlAction = async (originUrl?: string): Promise<GoogleCalendarAuthUrlResponse> => {
  const currentOrigin = originUrl || (typeof window !== "undefined" ? window.location.origin : "");
  const response = await api.get<GoogleCalendarAuthUrlResponse>("/google/calendar/auth-url", {
    params: { origin: currentOrigin || undefined }
  });
  return response.data;
};

export const getGoogleCalendarStatusAction = async (): Promise<GoogleCalendarStatusResponse> => {
  const response = await api.get<GoogleCalendarStatusResponse>("/google/calendar/status");
  return response.data;
};

export const disconnectGoogleCalendarAction = async (
  payload?: DisconnectGoogleCalendarPayload
): Promise<DisconnectGoogleCalendarResponse> => {
  const response = await api.post<DisconnectGoogleCalendarResponse>("/google/calendar/disconnect", payload);
  return response.data;
};

export const updateGoogleCalendarNameAction = async (
  payload: UpdateGoogleCalendarNamePayload
): Promise<UpdateGoogleCalendarNameResponse> => {
  const response = await api.patch<UpdateGoogleCalendarNameResponse>("/google/calendar/name", payload);
  return response.data;
};

export const recreateGoogleCalendarAction = async (): Promise<RecreateGoogleCalendarResponse> => {
  const response = await api.post<RecreateGoogleCalendarResponse>("/google/calendar/recreate");
  return response.data;
};

export const listGoogleCalendarsAction = async (): Promise<ListGoogleCalendarsResponse> => {
  const response = await api.get<ListGoogleCalendarsResponse>("/google/calendar/list");
  return response.data;
};

export const updateSelectedGoogleCalendarsAction = async (
  payload: UpdateSelectedGoogleCalendarsPayload
): Promise<UpdateSelectedGoogleCalendarsResponse> => {
  const response = await api.put<UpdateSelectedGoogleCalendarsResponse>("/google/calendar/selected", payload);
  return response.data;
};
