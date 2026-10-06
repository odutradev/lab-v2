import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

extendZodWithOpenApi(z)

export const healthResponseSchema = z.object({
  clusterName: z.string().openapi({ example: 'offline' }),
  mode: z.string().openapi({ example: 'development' }),
  version: z.string().openapi({ example: '1.0.5' }),
  uptime: z.number().openapi({ example: 123.45 }),
  status: z.string().openapi({ example: 'OK' })
})