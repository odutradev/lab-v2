import type { UserProfile, UserHealth } from '@utils/types/user'

export interface UpdateProfilePayload {
  name?: string
  avatar?: string
  health?: Partial<UserHealth>
}

export type UpdateHealthPayload = Partial<UserHealth>
export type HealthResponse = UserHealth

export interface ResetPasswordPayload {
  token: string
  password: string
}

export interface ResetPasswordResponse {
  id: string
}

export type ProfileResponse = UserProfile
