import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import registry from '@factories/docs/registry'

extendZodWithOpenApi(z)

export const habitResponseSchema = registry.register('HabitResponse', z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  active: z.boolean(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
}))

export const listHabitsResponseSchema = registry.register('ListHabitsResponse', z.array(habitResponseSchema))

export const createHabitBodySchema = registry.register('CreateHabitBody', z.object({
  title: z.string().min(1, 'Title is required').max(120),
  description: z.string().max(500).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly'])
}))

export const updateHabitParamsSchema = registry.register('UpdateHabitParams', z.object({
  id: z.string().min(1, 'Habit ID is required')
}))

export const updateHabitBodySchema = registry.register('UpdateHabitBody', z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  active: z.boolean().optional()
}))

export const removeHabitParamsSchema = registry.register('RemoveHabitParams', z.object({
  id: z.string().min(1, 'Habit ID is required')
}))

export const listHabitsQuerySchema = registry.register('ListHabitsQuery', z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  active: z.preprocess((val) => {
    if (val === 'true') return true
    if (val === 'false') return false
    return val
  }, z.boolean().optional()).optional()
}))

export const scheduleHabitBodySchema = registry.register('ScheduleHabitBody', z.object({
  habitId: z.string().min(1, 'Habit ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD')
}))

export const habitActionSuccessResponseSchema = registry.register('HabitActionSuccessResponse', z.object({
  success: z.boolean()
}))
