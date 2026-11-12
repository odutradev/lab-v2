import type { updateNutritionProfileBodySchema, nutritionProfileResponseSchema } from './schemas'
import type { z } from 'zod'

export type UpdateNutritionProfileBody = z.infer<typeof updateNutritionProfileBodySchema>
export type NutritionProfileResponse = z.infer<typeof nutritionProfileResponseSchema>
