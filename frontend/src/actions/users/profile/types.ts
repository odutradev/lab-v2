import type { UserProfile, UserHealth } from '@projectTypes/user'

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
  success: boolean
}

export type ProfileResponse = UserProfile
