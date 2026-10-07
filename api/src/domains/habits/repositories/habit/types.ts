import type { HydratedDocument, Document, Types } from 'mongoose'

export type HabitFrequency = 'daily' | 'weekly' | 'monthly' | 'custom' | 'none'
export type HabitCategory = 'event' | 'task' | 'schedule'

export interface HabitRecurrence {
  type: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom'
  interval?: number
  unit?: 'day' | 'week' | 'month'
  daysOfWeek?: number[]
  endType?: 'never' | 'on_date' | 'after_occurrences'
  endDate?: string
  occurrences?: number
}

export interface Habit {
  userId: Types.ObjectId | string
  title: string
  description?: string
  category?: HabitCategory
  frequency: HabitFrequency
  startDate?: string
  allDay?: boolean
  startTime?: string
  endTime?: string
  recurrence?: HabitRecurrence
  excludedDates?: string[]
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
  category?: HabitCategory
  frequency?: HabitFrequency
  startDate?: string
  allDay?: boolean
  startTime?: string
  endTime?: string
  recurrence?: HabitRecurrence
  excludedDates?: string[]
}

export type UpdateHabitPayload = {
  title?: string
  description?: string
  category?: HabitCategory
  frequency?: HabitFrequency
  startDate?: string
  allDay?: boolean
  startTime?: string
  endTime?: string
  recurrence?: HabitRecurrence
  excludedDates?: string[]
  active?: boolean
}

export interface ListHabitsFilters {
  frequency?: HabitFrequency
  category?: HabitCategory
  active?: boolean
}

