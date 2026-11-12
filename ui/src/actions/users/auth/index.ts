import apiClient from '@api/client'

import type { SignInPayload, SignUpPayload, RefreshTokenPayload, AuthResponse } from './types'

export const signUpAction = async (payload: SignUpPayload): Promise<AuthResponse> => {
  return apiClient.post<AuthResponse>('/users/signup', payload, { skipAuth: true })
}

export const signInAction = async (payload: SignInPayload): Promise<AuthResponse> => {
  return apiClient.post<AuthResponse>('/users/signin', payload, { skipAuth: true })
}

export const refreshTokenAction = async (payload: RefreshTokenPayload): Promise<AuthResponse> => {
  return apiClient.post<AuthResponse>('/users/refresh', payload, { skipAuth: true })
}
