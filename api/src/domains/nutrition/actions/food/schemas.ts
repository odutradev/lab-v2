import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import { paginationQuerySchema, createPaginatedSchema } from '@factories/pagination/schemas'
import registry from '@factories/docs/registry'

extendZodWithOpenApi(z)

export const foodResponseSchema = registry.register('FoodResponse', z.object({
  id: z.string(),
  userId: z.string().optional(),
  name: z.string(),
  category: z.string(),
  source: z.enum(['taco', 'custom']),
  caloriesPer100g: z.number(),
  proteinPer100g: z.number(),
  carbsPer100g: z.number(),
  fatPer100g: z.number(),
  fiberPer100g: z.number().optional(),
  servingName: z.string().optional(),
  servingGrams: z.number().optional()
}))

export const listFoodsQuerySchema = registry.register('ListFoodsQuery', paginationQuerySchema.extend({
  search: z.string().max(80).optional(),
  source: z.enum(['taco', 'custom']).optional()
}))

export const listFoodsResponseSchema = registry.register('ListFoodsResponse', createPaginatedSchema(foodResponseSchema, 'PaginatedFoods'))

export const createFoodBodySchema = registry.register('CreateFoodBody', z.object({
  name: z.string().min(2, 'Nome do alimento é obrigatório').max(120),
  category: z.string().max(60).optional(),
  caloriesPer100g: z.number().min(0).max(1000),
  proteinPer100g: z.number().min(0).max(100),
  carbsPer100g: z.number().min(0).max(100),
  fatPer100g: z.number().min(0).max(100),
  fiberPer100g: z.number().min(0).max(100).optional(),
  servingName: z.string().max(40).optional(),
  servingGrams: z.number().min(1).max(2000).optional()
}))

export const foodParamsSchema = registry.register('FoodParams', z.object({
  id: z.string().min(1, 'ID do alimento é obrigatório')
}))

export const foodIdResponseSchema = registry.register('FoodIdResponse', z.object({
  id: z.string()
}))
