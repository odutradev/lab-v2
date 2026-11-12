import type { HydratedDocument, Document, Types } from 'mongoose'

export type FoodLogEntrySource = 'plan' | 'food' | 'quick'

export interface FoodLogEntry {
  userId: Types.ObjectId | string
  date: string
  mealName: string
  planMealId?: string
  foodId?: string
  name: string
  grams?: number
  calories: number
  protein: number
  carbs: number
  fat: number
  source: FoodLogEntrySource
}

export interface FoodLogEntryDocument extends FoodLogEntry, Document {
  createdAt: Date
  updatedAt: Date
}

export type FoodLogEntryModelType = HydratedDocument<FoodLogEntryDocument>

export interface CreateFoodLogEntryPayload {
  userId: string
  date: string
  mealName: string
  planMealId?: string
  foodId?: string
  name: string
  grams?: number
  calories: number
  protein: number
  carbs: number
  fat: number
  source: FoodLogEntrySource
}
