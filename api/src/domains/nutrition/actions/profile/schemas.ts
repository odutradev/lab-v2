import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import registry from '@factories/docs/registry'

extendZodWithOpenApi(z)

const DateKeyRegex = /^\d{4}-\d{2}-\d{2}$/

export const nutritionGoalSchema = z.enum(['maintenance', 'cutting', 'bulking', 'recomposition'])

export const nutritionPhaseSchema = registry.register('NutritionPhase', z.object({
  goal: nutritionGoalSchema,
  startDate: z.string(),
  endDate: z.string(),
  startWeight: z.number().optional(),
  endWeight: z.number().optional()
}))

export const nutritionTargetsSchema = registry.register('NutritionTargets', z.object({
  bmr: z.number(),
  tdee: z.number(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number()
}))

export const nutritionProfileSchema = registry.register('NutritionProfile', z.object({
  id: z.string(),
  userId: z.string(),
  sex: z.enum(['male', 'female']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'veryActive']),
  goal: nutritionGoalSchema,
  adjustmentPercent: z.number(),
  proteinPerKg: z.number(),
  fatPerKg: z.number(),
  customCalories: z.number().optional(),
  includeWorkoutCalories: z.boolean(),
  targetWeight: z.number().optional(),
  phaseStartDate: z.string(),
  phaseStartWeight: z.number().optional(),
  phaseEndDate: z.string().optional(),
  phaseHistory: z.array(nutritionPhaseSchema)
}))

export const nutritionProfileResponseSchema = registry.register('NutritionProfileResponse', z.object({
  profile: nutritionProfileSchema.nullable(),
  metrics: z.object({ weight: z.number().optional(), height: z.number().optional(), age: z.number().optional() }),
  missingFields: z.array(z.string()),
  targets: nutritionTargetsSchema.nullable()
}))

export const updateNutritionProfileBodySchema = registry.register('UpdateNutritionProfileBody', z.object({
  sex: z.enum(['male', 'female']).optional(),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'veryActive']).optional(),
  goal: nutritionGoalSchema.optional(),
  adjustmentPercent: z.number().min(-35).max(30).optional(),
  proteinPerKg: z.number().min(0.8).max(3.5).optional(),
  fatPerKg: z.number().min(0.4).max(2).optional(),
  customCalories: z.number().int().min(800).max(8000).nullable().optional(),
  includeWorkoutCalories: z.boolean().optional(),
  targetWeight: z.number().min(30).max(300).nullable().optional(),
  phaseEndDate: z.string().regex(DateKeyRegex, 'Data deve seguir o formato YYYY-MM-DD').nullable().optional()
}))
