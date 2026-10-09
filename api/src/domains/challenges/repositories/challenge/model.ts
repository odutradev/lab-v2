import { Schema, model } from 'mongoose'

import type { ChallengeDocument } from '@domains/challenges/repositories/challenge/types'

const challengeSchema = new Schema<ChallengeDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: false },
    motivation: { type: String, required: false },
    emoji: { type: String, default: '🎯' },
    targetDays: { type: Number, required: true, min: 1 },
    startDate: { type: String, required: true },
    checkins: { type: [String], default: [] },
    status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active', index: true },
    type: { type: String, enum: ['streak', 'accumulative'], default: 'streak' },
    resetOnMiss: { type: Boolean, default: false },
    slipDates: { type: [String], default: [] }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

challengeSchema.index({ userId: 1, status: 1 })
challengeSchema.index({ userId: 1, createdAt: -1 })

export const ChallengeModel = model<ChallengeDocument>('Challenge', challengeSchema)
