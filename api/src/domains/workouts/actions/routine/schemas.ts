import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import { paginationQuerySchema, createPaginatedSchema } from '@factories/pagination/schemas'
import { WorkoutModalities } from '@domains/workouts/utils/catalog'
import registry from '@factories/docs/registry'

extendZodWithOpenApi(z)

const modalityIds = WorkoutModalities.map((modality) => modality.id)

export const routineExerciseSchema = registry.register('RoutineExercise', z.object({
  exerciseId: z.string().max(60).optional(),
  name: z.string().min(1, 'Nome do exercício é obrigatório').max(120),
  sets: z.number().int().min(1).max(20),
  reps: z.string().min(1).max(20),
  load: z.number().min(0).max(1000).optional(),
  restSeconds: z.number().int().min(0).max(900).optional()
}))

export const workoutRoutineResponseSchema = registry.register('WorkoutRoutineResponse', z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  modalityId: z.string(),
  weekDays: z.array(z.number()),
  exercises: z.array(routineExerciseSchema),
  durationMinutes: z.number().optional(),
  distanceKm: z.number().optional(),
  notes: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
}))

export const listWorkoutRoutinesQuerySchema = registry.register('ListWorkoutRoutinesQuery', paginationQuerySchema.extend({
  isActive: z.enum(['true', 'false']).optional()
}))

export const listWorkoutRoutinesResponseSchema = registry.register(
  'ListWorkoutRoutinesResponse',
  createPaginatedSchema(workoutRoutineResponseSchema, 'PaginatedWorkoutRoutines')
)

export const createWorkoutRoutineBodySchema = registry.register('CreateWorkoutRoutineBody', z.object({
  name: z.string().min(1, 'Nome da rotina é obrigatório').max(80),
  modalityId: z.string().refine((value) => modalityIds.includes(value), 'Modalidade inválida'),
  weekDays: z.array(z.number().int().min(0).max(6)).max(7),
  exercises: z.array(routineExerciseSchema).max(40).optional(),
  durationMinutes: z.number().int().min(1).max(600).optional(),
  distanceKm: z.number().min(0).max(500).optional(),
  notes: z.string().max(1000).optional()
}))

export const updateWorkoutRoutineBodySchema = registry.register(
  'UpdateWorkoutRoutineBody',
  createWorkoutRoutineBodySchema.partial().extend({ isActive: z.boolean().optional() })
)

export const workoutRoutineParamsSchema = registry.register('WorkoutRoutineParams', z.object({
  id: z.string().min(1, 'ID da rotina é obrigatório')
}))

export const applyRoutineTemplateBodySchema = registry.register('ApplyRoutineTemplateBody', z.object({
  templateId: z.string().min(1, 'Modelo é obrigatório')
}))

export const applyRoutineTemplateResponseSchema = registry.register('ApplyRoutineTemplateResponse', z.object({
  ids: z.array(z.string())
}))

export const workoutRoutineIdResponseSchema = registry.register('WorkoutRoutineIdResponse', z.object({
  id: z.string()
}))
