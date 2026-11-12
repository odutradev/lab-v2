import api from "@utils/api";

import type {
  UpdateProfilePayload,
  ProfileResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  UpdateHealthPayload,
  HealthResponse
} from "@actions/users/profile/types";

export const getProfileAction = async (): Promise<ProfileResponse> => {
  const response = await api.get<ProfileResponse>("/users/profile/details");
  return response.data;
};

export const updateProfileAction = async (payload: UpdateProfilePayload): Promise<ProfileResponse> => {
  const response = await api.put<ProfileResponse>("/users/profile/update", payload);
  return response.data;
};

export const updateHealthAction = async (payload: UpdateHealthPayload): Promise<HealthResponse> => {
  const response = await api.patch<HealthResponse>("/users/profile/health", payload);
  return response.data;
};

export const resetPasswordAction = async (payload: ResetPasswordPayload): Promise<ResetPasswordResponse> => {
  const response = await api.post<ResetPasswordResponse>("/users/profile/reset-password", payload, { skipAuth: true });
  return response.data;
};
