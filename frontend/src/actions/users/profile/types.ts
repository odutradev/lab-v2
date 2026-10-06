import type { UserProfile } from '@projectTypes/user'

export interface UpdateProfilePayload {
  name?: string
  avatar?: string
}

export interface ResetPasswordPayload {
  token: string
  password: string
}

export interface ResetPasswordResponse {
  success: boolean
}

export type ProfileResponse = UserProfile
