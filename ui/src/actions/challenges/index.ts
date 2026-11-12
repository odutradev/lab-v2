import api from "@utils/api";

import type {
  Challenge,
  CreateChallengePayload,
  UpdateChallengePayload,
  CheckinChallengePayload,
  CheckinChallengeResponse,
  SlipChallengePayload,
  FreezeChallengePayload,
  FreezeChallengeResponse,
  ChallengeActionSuccessResponse,
  ListChallengesParams
} from "@actions/challenges/types";
import type { PaginatedResponse } from "@utils/types/api";

export const createChallengeAction = async (payload: CreateChallengePayload): Promise<Challenge> => {
  const response = await api.post<Challenge>("/challenges/create", payload);
  return response.data;
};

export const listChallengesAction = async (params?: ListChallengesParams): Promise<Challenge[]> => {
  const response = await api.get<PaginatedResponse<Challenge>>("/challenges/list", {
    params: { status: params?.status || undefined }
  });
  return response.data.data;
};

export const updateChallengeAction = async (id: string, payload: UpdateChallengePayload): Promise<Challenge> => {
  const response = await api.patch<Challenge>(`/challenges/${id}/update`, payload);
  return response.data;
};

export const removeChallengeAction = async (id: string): Promise<ChallengeActionSuccessResponse> => {
  const response = await api.delete<ChallengeActionSuccessResponse>(`/challenges/${id}/remove`);
  return response.data;
};

export const checkinChallengeAction = async (
  id: string,
  payload?: CheckinChallengePayload
): Promise<CheckinChallengeResponse> => {
  const response = await api.post<CheckinChallengeResponse>(`/challenges/${id}/checkin`, payload || {});
  return response.data;
};

export const slipChallengeAction = async (id: string, payload?: SlipChallengePayload): Promise<Challenge> => {
  const response = await api.post<Challenge>(`/challenges/${id}/slip`, payload || {});
  return response.data;
};

export const freezeChallengeAction = async (
  id: string,
  payload?: FreezeChallengePayload
): Promise<FreezeChallengeResponse> => {
  const response = await api.post<FreezeChallengeResponse>(`/challenges/${id}/freeze`, payload || {});
  return response.data;
};
