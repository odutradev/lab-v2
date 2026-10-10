import { Schema, model } from 'mongoose'

import type { ChallengeDocument } from '@domains/challenges/repositories/challenge/types'

const checklistItemSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false }
  },
  { _id: false }
)

const challengeSchema = new Schema<ChallengeDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: false },
    motivation: { type: String, required: false },
    notes: { type: String, required: false },
    checklist: { type: [checklistItemSchema], default: [] },
    emoji: { type: String, default: '🎯' },
    targetDays: { type: Number, required: true, min: 1 },
    startDate: { type: String, required: true },
    checkins: { type: [String], default: [] },
    status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active', index: true },
    type: { type: String, enum: ['streak', 'accumulative'], default: 'streak' },
    resetOnMiss: { type: Boolean, default: false },
    slipDates: { type: [String], default: [] },
    freezeDaysPerMonth: { type: Number, default: 2, min: 0, max: 7 },
    freezeDates: { type: [String], default: [] }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

challengeSchema.index({ userId: 1, status: 1 })
challengeSchema.index({ userId: 1, createdAt: -1 })

export const ChallengeModel = model<ChallengeDocument>('Challenge', challengeSchema)
