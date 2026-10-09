import apiClient from '@api/client'

import type {
  Challenge,
  CreateChallengePayload,
  UpdateChallengePayload,
  CheckinChallengePayload,
  CheckinChallengeResponse,
  SlipChallengePayload,
  ChallengeActionSuccessResponse,
  ListChallengesParams
} from './types'

export const createChallengeAction = async (payload: CreateChallengePayload): Promise<Challenge> => {
  return apiClient.post<Challenge>('/challenges/create', payload)
}

export const listChallengesAction = async (params?: ListChallengesParams): Promise<Challenge[]> => {
  const query = new URLSearchParams()
  if (params?.status) query.append('status', params.status)

  const queryString = query.toString() ? `?${query.toString()}` : ''
  return apiClient.get<Challenge[]>(`/challenges/list${queryString}`)
}

export const updateChallengeAction = async (id: string, payload: UpdateChallengePayload): Promise<Challenge> => {
  return apiClient.patch<Challenge>(`/challenges/${id}/update`, payload)
}

export const removeChallengeAction = async (id: string): Promise<ChallengeActionSuccessResponse> => {
  return apiClient.delete<ChallengeActionSuccessResponse>(`/challenges/${id}/remove`)
}

export const checkinChallengeAction = async (
  id: string,
  payload?: CheckinChallengePayload
): Promise<CheckinChallengeResponse> => {
  return apiClient.post<CheckinChallengeResponse>(`/challenges/${id}/checkin`, payload || {})
}

export const slipChallengeAction = async (
  id: string,
  payload?: SlipChallengePayload
): Promise<Challenge> => {
  return apiClient.post<Challenge>(`/challenges/${id}/slip`, payload || {})
}

const challengesActions = {
  createChallenge: createChallengeAction,
  listChallenges: listChallengesAction,
  updateChallenge: updateChallengeAction,
  removeChallenge: removeChallengeAction,
  checkinChallenge: checkinChallengeAction,
  slipChallenge: slipChallengeAction
}

export default challengesActions
