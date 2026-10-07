import type { removeHabitQuerySchema, createHabitBodySchema, updateHabitParamsSchema, updateHabitBodySchema, removeHabitParamsSchema, listHabitsQuerySchema, scheduleHabitBodySchema, habitResponseSchema } from '@domains/habits/actions/habit/schemas'
import type { z } from 'zod'

export type CreateHabitBody = z.infer<typeof createHabitBodySchema>
export type UpdateHabitParams = z.infer<typeof updateHabitParamsSchema>
export type UpdateHabitBody = z.infer<typeof updateHabitBodySchema>
export type RemoveHabitParams = z.infer<typeof removeHabitParamsSchema>
export type RemoveHabitQuery = z.infer<typeof removeHabitQuerySchema>
export type ListHabitsQuery = z.infer<typeof listHabitsQuerySchema>
export type ScheduleHabitBody = z.infer<typeof scheduleHabitBodySchema>
export type HabitResponse = z.infer<typeof habitResponseSchema>

