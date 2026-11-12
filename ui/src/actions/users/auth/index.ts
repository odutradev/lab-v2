import api from '@utils/api'

import type { SignInPayload, SignUpPayload, RefreshTokenPayload, AuthResponse } from '@actions/users/auth/types'

export const signUpAction = async (payload: SignUpPayload): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/users/signup', payload, { skipAuth: true })
  return response.data
}

export const signInAction = async (payload: SignInPayload): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/users/signin', payload, { skipAuth: true })
  return response.data
}

export const refreshTokenAction = async (payload: RefreshTokenPayload): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/users/refresh', payload, { skipAuth: true })
  return response.data
}
