import type { monthlyMetricsBodySchema, monthlyMetricsResponseSchema, monthlyMetricsDayItemSchema } from './schemas'
import type { z } from 'zod'

export type MonthlyMetricsBody = z.infer<typeof monthlyMetricsBodySchema>
export type MonthlyMetricsResponse = z.infer<typeof monthlyMetricsResponseSchema>
export type MonthlyMetricsDayItem = z.infer<typeof monthlyMetricsDayItemSchema>
