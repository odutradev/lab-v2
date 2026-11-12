import apiClient from '@api/client'

import type {
  UpdateProfilePayload,
  ProfileResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  UpdateHealthPayload,
  HealthResponse
} from './types'

export const getProfileAction = async (): Promise<ProfileResponse> => {
  return apiClient.get<ProfileResponse>('/users/profile/details')
}

export const updateProfileAction = async (payload: UpdateProfilePayload): Promise<ProfileResponse> => {
  return apiClient.put<ProfileResponse>('/users/profile/update', payload)
}

export const updateHealthAction = async (payload: UpdateHealthPayload): Promise<HealthResponse> => {
  return apiClient.patch<HealthResponse>('/users/profile/health', payload)
}

export const resetPasswordAction = async (payload: ResetPasswordPayload): Promise<ResetPasswordResponse> => {
  return apiClient.post<ResetPasswordResponse>('/users/profile/reset-password', payload, { skipAuth: true })
}
