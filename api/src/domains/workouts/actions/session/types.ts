import type { registerWorkoutSessionBodySchema, listWorkoutSessionsQuerySchema, workoutSessionParamsSchema, workoutSummaryQuerySchema } from './schemas'
import type { z } from 'zod'

export type RegisterWorkoutSessionBody = z.infer<typeof registerWorkoutSessionBodySchema>
export type ListWorkoutSessionsQuery = z.infer<typeof listWorkoutSessionsQuerySchema>
export type WorkoutSessionParams = z.infer<typeof workoutSessionParamsSchema>
export type WorkoutSummaryQuery = z.infer<typeof workoutSummaryQuerySchema>
