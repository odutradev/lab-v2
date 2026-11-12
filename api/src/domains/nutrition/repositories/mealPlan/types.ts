import type { HydratedDocument, Document, Types } from 'mongoose'

export interface MealPlanItem {
  id: string
  foodId: string
  foodName: string
  grams: number
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface MealPlanMeal {
  id: string
  name: string
  time?: string
  items: MealPlanItem[]
}

export interface MealPlan {
  userId: Types.ObjectId | string
  name: string
  isActive: boolean
  meals: MealPlanMeal[]
}

export interface MealPlanDocument extends MealPlan, Document {
  createdAt: Date
  updatedAt: Date
}

export type MealPlanModelType = HydratedDocument<MealPlanDocument>

export interface CreateMealPlanPayload {
  userId: string
  name: string
  isActive: boolean
  meals: MealPlanMeal[]
}

export interface UpdateMealPlanPayload {
  name?: string
  isActive?: boolean
  meals?: MealPlanMeal[]
}
