import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import registry from '@factories/docs/registry'

extendZodWithOpenApi(z)

export const errorDetailSchema = registry.register('ErrorDetail', z.object({
  field: z.string(),
  message: z.string()
}))

export const errorResponseSchema = registry.register('ErrorResponse', z.object({
  success: z.boolean().default(false),
  code: z.string(),
  message: z.string(),
  details: z.array(errorDetailSchema).optional()
}))