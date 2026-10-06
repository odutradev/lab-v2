import type { HydratedDocument, Document, Types } from 'mongoose'

export interface HabitCheckin {
  userId: Types.ObjectId | string
  habitId: Types.ObjectId | string
  date: string
  completed: boolean
}

export interface HabitCheckinDocument extends HabitCheckin, Document {
  createdAt: Date
  updatedAt: Date
}

export type HabitCheckinModelType = HydratedDocument<HabitCheckinDocument>

export type UpsertCheckinPayload = {
  userId: string
  habitId: string
  date: string
  completed: boolean
}
