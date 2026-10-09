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

export interface ChallengeActionSuccessResponse {
  success: boolean
}

export interface ListChallengesParams {
  status?: ChallengeStatus
}
