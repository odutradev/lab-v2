export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  superAdmin?: boolean
  emailVerified?: boolean
  accountStatus?: 'active' | 'blocked'
  createdAt?: string
  updatedAt?: string
}

export interface AuthTokens {
  token: string
  refreshToken: string
}
