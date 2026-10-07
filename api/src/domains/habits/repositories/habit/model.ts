import { Schema, model } from 'mongoose'

import type { HabitDocument } from '@domains/habits/repositories/habit/types'

const recurrenceSchema = new Schema(
  {
    type: { type: String, enum: ['none', 'daily', 'weekly', 'monthly', 'yearly', 'custom'], default: 'none' },
    interval: { type: Number, default: 1 },
    unit: { type: String, enum: ['day', 'week', 'month', 'year'], default: 'week' },
    daysOfWeek: { type: [Number], default: [] },
    endType: { type: String, enum: ['never', 'on_date', 'after_occurrences'], default: 'never' },
    endDate: { type: String, required: false },
    occurrences: { type: Number, required: false }
  },
  { _id: false }
)

const habitSchema = new Schema<HabitDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: false },
    category: { type: String, enum: ['event', 'habit', 'task', 'schedule'], default: 'habit' },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom', 'none'], default: 'daily' },
    startDate: { type: String, required: false },
    allDay: { type: Boolean, default: false },
    startTime: { type: String, required: false },
    endTime: { type: String, required: false },
    recurrence: { type: recurrenceSchema, required: false },
    excludedDates: { type: [String], default: [] },
    googleEventId: { type: String, required: false },
    active: { type: Boolean, default: true, required: true }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

habitSchema.index({ userId: 1, active: 1, frequency: 1 })
habitSchema.index({ userId: 1, startDate: 1 })

export const HabitModel = model<HabitDocument>('Habit', habitSchema)

