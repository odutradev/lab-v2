import { apiClient } from '../../api/client'
import type { UpdateProfilePayload, ProfileResponse } from './types'

export const getProfileAction = async (): Promise<ProfileResponse> => {
  return apiClient.get<ProfileResponse>('/users/profile/details')
}

export const updateProfileAction = async (payload: UpdateProfilePayload): Promise<ProfileResponse> => {
  return apiClient.put<ProfileResponse>('/users/profile/update', payload)
}
