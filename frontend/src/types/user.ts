export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  superAdmin?: boolean
  emailVerified?: boolean
  accountStatus?: 'active' | 'blocked'
  integrations?: {
    googleCalendar?: {
      connected: boolean
      email?: string
      calendarId?: string
      connectedAt?: string
    }
  }
  createdAt?: string
  updatedAt?: string
}

export interface AuthTokens {
  token: string
  refreshToken: string
}
