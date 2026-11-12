import { Schema, model } from 'mongoose'

import type { NutritionProfileDocument } from '@domains/nutrition/repositories/nutritionProfile/types'

const nutritionPhaseSchema = new Schema(
  {
    goal: { type: String, enum: ['maintenance', 'cutting', 'bulking', 'recomposition'], required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    startWeight: { type: Number, required: false },
    endWeight: { type: Number, required: false }
  },
  { _id: false }
)

const nutritionProfileSchema = new Schema<NutritionProfileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    sex: { type: String, enum: ['male', 'female'], required: true },
    activityLevel: { type: String, enum: ['sedentary', 'light', 'moderate', 'active', 'veryActive'], required: true },
    goal: { type: String, enum: ['maintenance', 'cutting', 'bulking', 'recomposition'], required: true },
    adjustmentPercent: { type: Number, default: 0 },
    proteinPerKg: { type: Number, default: 1.8 },
    fatPerKg: { type: Number, default: 0.9 },
    customCalories: { type: Number, required: false },
    includeWorkoutCalories: { type: Boolean, default: false },
    targetWeight: { type: Number, required: false },
    phaseStartDate: { type: String, required: true },
    phaseStartWeight: { type: Number, required: false },
    phaseEndDate: { type: String, required: false },
    phaseHistory: { type: [nutritionPhaseSchema], default: [] }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

export const NutritionProfileModel = model<NutritionProfileDocument>('NutritionProfile', nutritionProfileSchema)
