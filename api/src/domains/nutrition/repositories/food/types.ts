import type { HydratedDocument, Document, Types } from 'mongoose'

export type FoodSource = 'taco' | 'custom'

export interface Food {
  userId?: Types.ObjectId | string
  name: string
  normalizedName: string
  category: string
  source: FoodSource
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  fiberPer100g?: number
  servingName?: string
  servingGrams?: number
}

export interface FoodDocument extends Food, Document {
  createdAt: Date
  updatedAt: Date
}

export type FoodModelType = HydratedDocument<FoodDocument>

export interface CreateFoodPayload {
  userId: string
  name: string
  category?: string
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  fiberPer100g?: number
  servingName?: string
  servingGrams?: number
}

export interface ListFoodsFilters {
  search?: string
  source?: FoodSource
  limit: number
  offset: number
}
