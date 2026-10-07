import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import registry from '@factories/docs/registry'

extendZodWithOpenApi(z)

export const habitRecurrenceSchema = registry.register('HabitRecurrence', z.object({
  type: z.enum(['none', 'daily', 'weekly', 'monthly', 'custom']).default('none'),
  interval: z.number().int().min(1).default(1).optional(),
  unit: z.enum(['day', 'week', 'month']).default('week').optional(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  endType: z.enum(['never', 'on_date', 'after_occurrences']).default('never').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  occurrences: z.number().int().min(1).optional()
}))

export const habitResponseSchema = registry.register('HabitResponse', z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  category: z.enum(['event', 'task', 'schedule']).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'custom', 'none']),
  startDate: z.string().optional(),
  allDay: z.boolean().optional(),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  recurrence: habitRecurrenceSchema.optional(),
  excludedDates: z.array(z.string()).optional(),
  googleEventId: z.string().optional().nullable(),
  active: z.boolean(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
}))

export const listHabitsResponseSchema = registry.register('ListHabitsResponse', z.array(habitResponseSchema))

const optionalTimeSchema = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined) return undefined
  if (typeof val === 'string') {
    const trimmed = val.trim()
    if (!trimmed) return undefined
    if (/^\d:[0-5]\d$/.test(trimmed)) {
      return `0${trimmed}`
    }
    return trimmed
  }
  return val
}, z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time format (HH:mm)').optional().nullable())

export const createHabitBodySchema = registry.register('CreateHabitBody', z.object({
  title: z.string().min(1, 'Title is required').max(120),
  description: z.string().max(500).optional(),
  category: z.enum(['event', 'task', 'schedule']).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'custom', 'none']).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD').optional(),
  allDay: z.boolean().optional(),
  startTime: optionalTimeSchema,
  endTime: optionalTimeSchema,
  recurrence: habitRecurrenceSchema.optional()
}))

export const updateHabitParamsSchema = registry.register('UpdateHabitParams', z.object({
  id: z.string().min(1, 'Habit ID is required')
}))

export const updateHabitBodySchema = registry.register('UpdateHabitBody', z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
  category: z.enum(['event', 'task', 'schedule']).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'custom', 'none']).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD').optional(),
  allDay: z.boolean().optional(),
  startTime: optionalTimeSchema,
  endTime: optionalTimeSchema,
  recurrence: habitRecurrenceSchema.optional(),
  excludedDates: z.array(z.string()).optional(),
  active: z.boolean().optional(),
  mode: z.enum(['this', 'following', 'all']).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD').optional()
}))

export const removeHabitParamsSchema = registry.register('RemoveHabitParams', z.object({
  id: z.string().min(1, 'Habit ID is required')
}))

export const removeHabitQuerySchema = registry.register('RemoveHabitQuery', z.object({
  mode: z.enum(['this', 'following', 'all']).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD').optional()
}))

export const listHabitsQuerySchema = registry.register('ListHabitsQuery', z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly', 'custom', 'none']).optional(),
  category: z.enum(['event', 'task', 'schedule']).optional(),
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

