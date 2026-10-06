import { Schema, model } from 'mongoose'

import type { HabitDocument } from '@domains/habits/repositories/habit/types'

const habitSchema = new Schema<HabitDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: false },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
    active: { type: Boolean, default: true, required: true }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

habitSchema.index({ userId: 1, active: 1, frequency: 1 })

export const HabitModel = model<HabitDocument>('Habit', habitSchema)
