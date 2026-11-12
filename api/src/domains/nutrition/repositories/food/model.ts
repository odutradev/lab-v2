import { Schema, model } from 'mongoose'

import type { FoodDocument } from '@domains/nutrition/repositories/food/types'

const foodSchema = new Schema<FoodDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    name: { type: String, required: true, trim: true },
    normalizedName: { type: String, required: true, index: true },
    category: { type: String, default: 'Outros' },
    source: { type: String, enum: ['taco', 'custom'], required: true },
    caloriesPer100g: { type: Number, required: true, min: 0 },
    proteinPer100g: { type: Number, required: true, min: 0 },
    carbsPer100g: { type: Number, required: true, min: 0 },
    fatPer100g: { type: Number, required: true, min: 0 },
    fiberPer100g: { type: Number, required: false },
    servingName: { type: String, required: false },
    servingGrams: { type: Number, required: false }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

foodSchema.index({ source: 1, normalizedName: 1 })

export const FoodModel = model<FoodDocument>('Food', foodSchema)
