import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import registry from '@factories/docs/registry'

extendZodWithOpenApi(z)

export const toggleCheckinBodySchema = registry.register('ToggleCheckinBody', z.object({
  habitId: z.string().min(1, 'Habit ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD').optional(),
  completed: z.boolean().optional()
}))

export const toggleCheckinResponseSchema = registry.register('ToggleCheckinResponse', z.object({
  habitId: z.string(),
  date: z.string(),
  completed: z.boolean()
}))

export const daySummaryQuerySchema = registry.register('DaySummaryQuery', z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD').optional()
}))

export const daySummaryItemSchema = registry.register('DaySummaryItem', z.object({
  habitId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  category: z.enum(['event', 'habit', 'task', 'schedule']).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'custom', 'none']).optional(),
  startDate: z.string().optional(),
  allDay: z.boolean().optional(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  completed: z.boolean()
}))

export const daySummaryResponseSchema = registry.register('DaySummaryResponse', z.object({
  date: z.string(),
  totalHabits: z.number(),
  completedHabits: z.number(),
  completionRate: z.number(),
  items: z.array(daySummaryItemSchema)
}))

export const rangeSummaryQuerySchema = registry.register('RangeSummaryQuery', z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be formatted as YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be formatted as YYYY-MM-DD')
}))

export const rangeSummaryResponseSchema = registry.register('RangeSummaryResponse', z.array(daySummaryResponseSchema))
