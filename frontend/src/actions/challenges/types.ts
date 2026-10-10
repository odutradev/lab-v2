export type ChallengeStatus = 'active' | 'completed' | 'paused'
export type ChallengeType = 'streak' | 'accumulative'

export interface Challenge {
  id: string
  userId: string
  title: string
  description?: string
  motivation?: string
  emoji: string
  targetDays: number
  startDate: string
  checkins: string[]
  status: ChallengeStatus
  type: ChallengeType
  resetOnMiss: boolean
  slipDates?: string[]
  freezeDaysPerMonth: number
  freezeDates?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateChallengePayload {
  title: string
  description?: string
  motivation?: string
  emoji?: string
  targetDays: number
  startDate?: string
  type?: ChallengeType
  resetOnMiss?: boolean
  freezeDaysPerMonth?: number
}

export interface UpdateChallengePayload {
  title?: string
  description?: string
  motivation?: string
  emoji?: string
  targetDays?: number
  startDate?: string
  status?: ChallengeStatus
  type?: ChallengeType
  resetOnMiss?: boolean
  freezeDaysPerMonth?: number
  freezeDates?: string[]
}

export interface CheckinChallengePayload {
  date?: string
}

export interface CheckinChallengeResponse {
  challenge: Challenge
  completedToday: boolean
}

export interface SlipChallengePayload {
  date?: string
  resetCheckins?: boolean
}

export interface FreezeChallengePayload {
  date?: string
}

export interface FreezeChallengeResponse {
  challenge: Challenge
  frozen: boolean
  error?: string
}

export interface ChallengeActionSuccessResponse {
  success: boolean
}

export interface ListChallengesParams {
  status?: ChallengeStatus
}
