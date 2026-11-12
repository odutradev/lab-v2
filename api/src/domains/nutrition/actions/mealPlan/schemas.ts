import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import { paginationQuerySchema, createPaginatedSchema } from '@factories/pagination/schemas'
import registry from '@factories/docs/registry'

extendZodWithOpenApi(z)

export const macrosSchema = registry.register('Macros', z.object({
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number()
}))

export const mealPlanItemSchema = registry.register('MealPlanItem', macrosSchema.extend({
  id: z.string(),
  foodId: z.string(),
  foodName: z.string(),
  grams: z.number()
}))

export const mealPlanMealSchema = registry.register('MealPlanMeal', z.object({
  id: z.string(),
  name: z.string(),
  time: z.string().optional(),
  items: z.array(mealPlanItemSchema),
  totals: macrosSchema
}))

export const mealPlanResponseSchema = registry.register('MealPlanResponse', z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  isActive: z.boolean(),
  meals: z.array(mealPlanMealSchema),
  totals: macrosSchema,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
}))

export const listMealPlansQuerySchema = registry.register('ListMealPlansQuery', paginationQuerySchema)

export const listMealPlansResponseSchema = registry.register('ListMealPlansResponse', createPaginatedSchema(mealPlanResponseSchema, 'PaginatedMealPlans'))

const mealPlanMealInputSchema = z.object({
  id: z.string().max(60).optional(),
  name: z.string().min(1, 'Nome da refeição é obrigatório').max(60),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve seguir o formato HH:mm').optional(),
  items: z.array(z.object({
    foodId: z.string().min(1),
    grams: z.number().min(1).max(5000)
  })).max(40)
})

export const createMealPlanBodySchema = registry.register('CreateMealPlanBody', z.object({
  name: z.string().min(1, 'Nome do plano é obrigatório').max(80),
  isActive: z.boolean().optional(),
  meals: z.array(mealPlanMealInputSchema).max(12)
}))

export const updateMealPlanBodySchema = registry.register('UpdateMealPlanBody', createMealPlanBodySchema.partial())

export const mealPlanParamsSchema = registry.register('MealPlanParams', z.object({
  id: z.string().min(1, 'ID do plano é obrigatório')
}))

export const mealPlanIdResponseSchema = registry.register('MealPlanIdResponse', z.object({
  id: z.string()
}))
