import { Schema, model } from 'mongoose'

import type { MealPlanDocument } from '@domains/nutrition/repositories/mealPlan/types'

const mealPlanItemSchema = new Schema(
  {
    id: { type: String, required: true },
    foodId: { type: String, required: true },
    foodName: { type: String, required: true },
    grams: { type: Number, required: true, min: 0 },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true }
  },
  { _id: false }
)

const mealPlanMealSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    time: { type: String, required: false },
    items: { type: [mealPlanItemSchema], default: [] }
  },
  { _id: false }
)

const mealPlanSchema = new Schema<MealPlanDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: false },
    meals: { type: [mealPlanMealSchema], default: [] }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

export const MealPlanModel = model<MealPlanDocument>('MealPlan', mealPlanSchema)
