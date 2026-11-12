import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import registry from '@factories/docs/registry'

extendZodWithOpenApi(z)

export const workoutModalitySchema = registry.register('WorkoutModality', z.object({
  id: z.string(),
  name: z.string(),
  kind: z.enum(['strength', 'cardio', 'sport']),
  met: z.number()
}))

export const libraryExerciseSchema = registry.register('LibraryExercise', z.object({
  id: z.string(),
  name: z.string(),
  muscleGroup: z.enum(['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'glutes', 'calves', 'core'])
}))

export const routineTemplateSchema = registry.register('RoutineTemplate', z.object({
  id: z.string(),
  name: z.string(),
  routines: z.array(z.object({
    name: z.string(),
    weekDays: z.array(z.number()),
    exercises: z.array(z.object({ exerciseId: z.string(), sets: z.number(), reps: z.string() }))
  }))
}))

export const workoutCatalogResponseSchema = registry.register('WorkoutCatalogResponse', z.object({
  modalities: z.array(workoutModalitySchema),
  exercises: z.array(libraryExerciseSchema),
  templates: z.array(routineTemplateSchema)
}))
