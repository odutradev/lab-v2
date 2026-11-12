import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import { nutritionTargetsSchema, nutritionGoalSchema } from '@domains/nutrition/actions/profile/schemas'
import { macrosSchema } from '@domains/nutrition/actions/mealPlan/schemas'
import registry from '@factories/docs/registry'

extendZodWithOpenApi(z)

const DateKeyRegex = /^\d{4}-\d{2}-\d{2}$/

export const foodLogEntrySchema = registry.register('FoodLogEntry', macrosSchema.extend({
  id: z.string(),
  date: z.string(),
  mealName: z.string(),
  planMealId: z.string().optional(),
  foodId: z.string().optional(),
  name: z.string(),
  grams: z.number().optional(),
  source: z.enum(['plan', 'food', 'quick'])
}))

export const diaryQuerySchema = registry.register('DiaryQuery', z.object({
  date: z.string().regex(DateKeyRegex, 'Data deve seguir o formato YYYY-MM-DD').optional()
}))

export const diaryResponseSchema = registry.register('DiaryResponse', z.object({
  date: z.string(),
  entries: z.array(foodLogEntrySchema),
  totals: macrosSchema,
  targets: nutritionTargetsSchema.nullable(),
  burnedCalories: z.number(),
  calorieGoal: z.number().nullable(),
  remainingCalories: z.number().nullable()
}))

export const createDiaryEntryBodySchema = registry.register('CreateDiaryEntryBody', z.object({
  date: z.string().regex(DateKeyRegex, 'Data deve seguir o formato YYYY-MM-DD').optional(),
  mealName: z.string().min(1, 'Refeição é obrigatória').max(60),
  foodId: z.string().optional(),
  grams: z.number().min(1).max(5000).optional(),
  name: z.string().min(1).max(120).optional(),
  calories: z.number().min(0).max(10000).optional(),
  protein: z.number().min(0).max(1000).optional(),
  carbs: z.number().min(0).max(1000).optional(),
  fat: z.number().min(0).max(1000).optional()
}).refine((body) => Boolean((body.foodId && body.grams) || body.calories !== undefined), {
  message: 'Informe um alimento com a quantidade ou as calorias',
  path: ['calories']
}))

export const logPlanMealBodySchema = registry.register('LogPlanMealBody', z.object({
  date: z.string().regex(DateKeyRegex, 'Data deve seguir o formato YYYY-MM-DD').optional(),
  mealPlanId: z.string().min(1, 'Plano é obrigatório'),
  mealId: z.string().min(1, 'Refeição é obrigatória')
}))

export const diaryEntryIdsResponseSchema = registry.register('DiaryEntryIdsResponse', z.object({
  ids: z.array(z.string())
}))

export const diaryEntryParamsSchema = registry.register('DiaryEntryParams', z.object({
  id: z.string().min(1, 'ID do registro é obrigatório')
}))

export const diaryEntryIdResponseSchema = registry.register('DiaryEntryIdResponse', z.object({
  id: z.string()
}))

export const weeklyReviewResponseSchema = registry.register('WeeklyReviewResponse', z.object({
  goal: nutritionGoalSchema,
  targetRatePercent: z.number(),
  currentWeekAverageWeight: z.number().nullable(),
  previousWeekAverageWeight: z.number().nullable(),
  weeklyChangePercent: z.number().nullable(),
  loggedDays: z.number(),
  averageCalories: z.number().nullable(),
  adherentDays: z.number(),
  targetCalories: z.number().nullable(),
  status: z.enum(['insufficient_data', 'on_track', 'increase_calories', 'decrease_calories']),
  suggestedCalorieAdjustment: z.number()
}))
