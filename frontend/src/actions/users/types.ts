import type { AccountType, AuthTokens, UserProfile } from '../../types/user'

export interface SignUpPayload {
  name: string
  email: string
  password: string
  accountType: AccountType
  document?: string
  birthDate?: string
  phone?: string
  referralSource?: string
}

export interface SignInPayload {
  email: string
  password: string
}

export interface RefreshTokenPayload {
  refreshToken: string
}

export type AuthResponse = AuthTokens

export interface UpdateProfilePayload {
  name?: string
  phone?: string
  birthDate?: string
  document?: string
}

export type ProfileResponse = UserProfile
