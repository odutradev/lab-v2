import type { listWorkoutRoutinesQuerySchema, createWorkoutRoutineBodySchema, updateWorkoutRoutineBodySchema, applyRoutineTemplateBodySchema, workoutRoutineParamsSchema } from './schemas'
import type { z } from 'zod'

export type ListWorkoutRoutinesQuery = z.infer<typeof listWorkoutRoutinesQuerySchema>
export type CreateWorkoutRoutineBody = z.infer<typeof createWorkoutRoutineBodySchema>
export type UpdateWorkoutRoutineBody = z.infer<typeof updateWorkoutRoutineBodySchema>
export type ApplyRoutineTemplateBody = z.infer<typeof applyRoutineTemplateBodySchema>
export type WorkoutRoutineParams = z.infer<typeof workoutRoutineParamsSchema>
