import type { UserProfile } from '../../../types/user'

export interface UpdateProfilePayload {
  name?: string
  phone?: string
  birthDate?: string
  document?: string
}

export type ProfileResponse = UserProfile
