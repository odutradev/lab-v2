import { Schema, model } from 'mongoose'

import type { HabitCheckinDocument } from '@domains/habits/repositories/habitCheckin/types'

const habitCheckinSchema = new Schema<HabitCheckinDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    habitId: { type: Schema.Types.ObjectId, ref: 'Habit', required: true, index: true },
    date: { type: String, required: true },
    completed: { type: Boolean, default: true, required: true }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

habitCheckinSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true })
habitCheckinSchema.index({ userId: 1, date: 1 })

export const HabitCheckinModel = model<HabitCheckinDocument>('HabitCheckin', habitCheckinSchema)
