import { Schema, model } from 'mongoose'

import type { FoodLogEntryDocument } from '@domains/nutrition/repositories/foodLogEntry/types'

const foodLogEntrySchema = new Schema<FoodLogEntryDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    mealName: { type: String, required: true, trim: true },
    planMealId: { type: String, required: false },
    foodId: { type: String, required: false },
    name: { type: String, required: true, trim: true },
    grams: { type: Number, required: false },
    calories: { type: Number, required: true, min: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    source: { type: String, enum: ['plan', 'food', 'quick'], required: true }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

foodLogEntrySchema.index({ userId: 1, date: 1 })

export const FoodLogEntryModel = model<FoodLogEntryDocument>('FoodLogEntry', foodLogEntrySchema)
