import type { HydratedDocument, Document, Types } from 'mongoose'

import type { BiologicalSex, ActivityLevel, NutritionGoal } from '@domains/nutrition/utils/types'

export interface NutritionPhase {
  goal: NutritionGoal
  startDate: string
  endDate: string
  startWeight?: number
  endWeight?: number
}

export interface NutritionProfile {
  userId: Types.ObjectId | string
  sex: BiologicalSex
  activityLevel: ActivityLevel
  goal: NutritionGoal
  adjustmentPercent: number
  proteinPerKg: number
  fatPerKg: number
  customCalories?: number
  includeWorkoutCalories: boolean
  targetWeight?: number
  phaseStartDate: string
  phaseStartWeight?: number
  phaseEndDate?: string
  phaseHistory: NutritionPhase[]
}

export interface NutritionProfileDocument extends NutritionProfile, Document {
  createdAt: Date
  updatedAt: Date
}

export type NutritionProfileModelType = HydratedDocument<NutritionProfileDocument>

export type SaveNutritionProfilePayload = Omit<NutritionProfile, 'userId'>
