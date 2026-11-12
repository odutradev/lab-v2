import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import { paginationQuerySchema, createPaginatedSchema } from '@factories/pagination/schemas'
import { routineExerciseSchema } from '@domains/workouts/actions/routine/schemas'
import { WorkoutModalities } from '@domains/workouts/utils/catalog'
import registry from '@factories/docs/registry'

extendZodWithOpenApi(z)

const DateKeyRegex = /^\d{4}-\d{2}-\d{2}$/

const modalityIds = WorkoutModalities.map((modality) => modality.id)

export const workoutSessionResponseSchema = registry.register('WorkoutSessionResponse', z.object({
  id: z.string(),
  userId: z.string(),
  routineId: z.string().optional(),
  date: z.string(),
  modalityId: z.string(),
  name: z.string(),
  status: z.enum(['done', 'missed']),
  durationMinutes: z.number().optional(),
  distanceKm: z.number().optional(),
  effort: z.number().optional(),
  exercises: z.array(routineExerciseSchema),
  caloriesBurned: z.number(),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
}))

export const registerWorkoutSessionBodySchema = registry.register('RegisterWorkoutSessionBody', z.object({
  routineId: z.string().optional(),
  date: z.string().regex(DateKeyRegex, 'Data deve seguir o formato YYYY-MM-DD').optional(),
  status: z.enum(['done', 'missed']),
  modalityId: z.string().refine((value) => modalityIds.includes(value), 'Modalidade inválida').optional(),
  name: z.string().min(1).max(80).optional(),
  durationMinutes: z.number().int().min(1).max(600).optional(),
  distanceKm: z.number().min(0).max(500).optional(),
  effort: z.number().int().min(1).max(10).optional(),
  exercises: z.array(routineExerciseSchema).max(40).optional(),
  notes: z.string().max(1000).optional()
}).refine((body) => Boolean(body.routineId || body.modalityId), {
  message: 'Informe a rotina ou a modalidade do treino',
  path: ['modalityId']
}))

export const listWorkoutSessionsQuerySchema = registry.register('ListWorkoutSessionsQuery', paginationQuerySchema.extend({
  startDate: z.string().regex(DateKeyRegex).optional(),
  endDate: z.string().regex(DateKeyRegex).optional()
}))

export const listWorkoutSessionsResponseSchema = registry.register(
  'ListWorkoutSessionsResponse',
  createPaginatedSchema(workoutSessionResponseSchema, 'PaginatedWorkoutSessions')
)

export const workoutSessionParamsSchema = registry.register('WorkoutSessionParams', z.object({
  id: z.string().min(1, 'ID do treino é obrigatório')
}))

export const workoutSessionIdResponseSchema = registry.register('WorkoutSessionIdResponse', z.object({
  id: z.string()
}))

export const workoutSummaryQuerySchema = registry.register('WorkoutSummaryQuery', z.object({
  startDate: z.string().regex(DateKeyRegex, 'Data deve seguir o formato YYYY-MM-DD'),
  endDate: z.string().regex(DateKeyRegex, 'Data deve seguir o formato YYYY-MM-DD')
}))

export const workoutSummaryResponseSchema = registry.register('WorkoutSummaryResponse', z.object({
  plannedCount: z.number(),
  donePlannedCount: z.number(),
  doneCount: z.number(),
  missedCount: z.number(),
  adherenceRate: z.number(),
  totalMinutes: z.number(),
  totalCalories: z.number(),
  totalDistanceKm: z.number(),
  currentStreak: z.number(),
  modalities: z.array(z.object({ modalityId: z.string(), count: z.number(), minutes: z.number() }))
}))
