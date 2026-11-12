import type { listMealPlansQuerySchema, createMealPlanBodySchema, updateMealPlanBodySchema, mealPlanParamsSchema } from './schemas'
import type { z } from 'zod'

export type ListMealPlansQuery = z.infer<typeof listMealPlansQuerySchema>
export type CreateMealPlanBody = z.infer<typeof createMealPlanBodySchema>
export type UpdateMealPlanBody = z.infer<typeof updateMealPlanBodySchema>
export type MealPlanParams = z.infer<typeof mealPlanParamsSchema>
export type MealPlanMealInput = CreateMealPlanBody['meals'][number]
