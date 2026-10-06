import type { HydratedDocument, Document, Types } from 'mongoose'

export type HabitFrequency = 'daily' | 'weekly' | 'monthly'

export interface Habit {
  userId: Types.ObjectId | string
  title: string
  description?: string
  frequency: HabitFrequency
  active: boolean
}

export interface HabitDocument extends Habit, Document {
  createdAt: Date
  updatedAt: Date
}

export type HabitModelType = HydratedDocument<HabitDocument>

export type CreateHabitPayload = {
  userId: string
  title: string
  description?: string
  frequency: HabitFrequency
}

export type UpdateHabitPayload = {
  title?: string
  description?: string
  frequency?: HabitFrequency
  active?: boolean
}

export interface ListHabitsFilters {
  frequency?: HabitFrequency
  active?: boolean
}
