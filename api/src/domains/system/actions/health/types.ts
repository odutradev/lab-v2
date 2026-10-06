import type { healthResponseSchema } from '@domains/system/actions/health/schemas'
import type { z } from 'zod'

export type HealthResponse = z.infer<typeof healthResponseSchema>