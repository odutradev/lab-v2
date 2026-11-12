import type { listFoodsQuerySchema, createFoodBodySchema, foodParamsSchema } from './schemas'
import type { z } from 'zod'

export type ListFoodsQuery = z.infer<typeof listFoodsQuerySchema>
export type CreateFoodBody = z.infer<typeof createFoodBodySchema>
export type FoodParams = z.infer<typeof foodParamsSchema>
