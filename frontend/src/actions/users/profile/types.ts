import type { UserProfile } from '../../../types/user'

export interface UpdateProfilePayload {
  name?: string
  avatar?: string
}

export type ProfileResponse = UserProfile
