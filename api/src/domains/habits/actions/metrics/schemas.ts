import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import registry from '@factories/docs/registry'

extendZodWithOpenApi(z)

export const monthlyMetricsBodySchema = registry.register('MonthlyMetricsBody', z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Mês deve estar no formato YYYY-MM').optional(),
  waterDailyMap: z.record(z.string(), z.number()).optional(),
  waterGoalBottles: z.number().min(1).max(20).optional().default(4),
  waterExtraTargetMap: z.record(z.string(), z.number()).optional(),
  sleepDailyMap: z.record(z.string(), z.number()).optional(),
  sleepMinRecommendedHours: z.number().min(1).max(24).optional().default(7)
}))

export const monthlyMetricsDayItemSchema = registry.register('MonthlyMetricsDayItem', z.object({
  date: z.string(),
  day: z.number(),
  dayOfWeek: z.string(),
  isToday: z.boolean(),
  isFuture: z.boolean(),
  totalHabits: z.number(),
  completedHabits: z.number(),
  habitRate: z.number(),
  waterConsumedBottles: z.number(),
  waterGoalBottles: z.number(),
  waterGoalReached: z.boolean(),
  waterRate: z.number(),
  sleepHours: z.number(),
  sleepGoalHours: z.number(),
  sleepGoalReached: z.boolean(),
  sleepRate: z.number(),
  overallRate: z.number()
}))

export const monthlyMetricsResponseSchema = registry.register('MonthlyMetricsResponse', z.object({
  month: z.string(),
  monthLabel: z.string(),
  averageOverallRate: z.number(),
  averageHabitRate: z.number(),
  averageWaterRate: z.number(),
  averageSleepRate: z.number(),
  perfectDaysCount: z.number(),
  trackedDaysCount: z.number(),
  daysInMonth: z.number(),
  formulaExplanation: z.string(),
  days: z.array(monthlyMetricsDayItemSchema)
}))
