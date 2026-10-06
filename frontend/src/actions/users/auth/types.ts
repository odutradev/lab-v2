import type { AccountType, AuthTokens } from '../../../types/user'

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
