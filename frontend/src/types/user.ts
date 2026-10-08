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
      calendarName?: string
      calendarUrl?: string
      connectedAt?: string
    }
  }
  health?: UserHealth
  createdAt?: string
  updatedAt?: string
}

export interface UserWeightRecord {
  date: string
  weight: number
}

export interface UserHealth {
  height?: number
  age?: number
  characterId?: string
  weightHistory?: UserWeightRecord[]
  waterDailyMap?: Record<string, number>
  waterExtraTargetMap?: Record<string, number>
  waterBottleMl?: number
  waterTargetBottles?: number
}

export interface AuthTokens {
  token: string
  refreshToken: string
}
