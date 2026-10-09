import type { HydratedDocument, Document, Types } from 'mongoose'

export type ChallengeStatus = 'active' | 'completed' | 'paused'
export type ChallengeType = 'streak' | 'accumulative'

export interface Challenge {
  userId: Types.ObjectId | string
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
}

export interface ChallengeDocument extends Challenge, Document {
  createdAt: Date
  updatedAt: Date
}

export type ChallengeModelType = HydratedDocument<ChallengeDocument>

export interface CreateChallengePayload {
  userId: string
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
  checkins?: string[]
  slipDates?: string[]
}

export interface ListChallengesFilters {
  status?: ChallengeStatus
}
