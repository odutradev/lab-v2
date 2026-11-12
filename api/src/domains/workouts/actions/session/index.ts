import { registerWorkoutSessionBodySchema, workoutSessionResponseSchema, listWorkoutSessionsQuerySchema, listWorkoutSessionsResponseSchema, workoutSessionParamsSchema, workoutSessionIdResponseSchema, workoutSummaryQuerySchema, workoutSummaryResponseSchema } from './schemas'
import workoutSessionRepository from '@domains/workouts/repositories/workoutSession'
import workoutRoutineRepository from '@domains/workouts/repositories/workoutRoutine'
import { estimateCaloriesBurned, findModality } from '@domains/workouts/utils/calories'
import { calculateWorkoutSummary } from '@domains/workouts/utils/summary'
import authMiddlewareWithDocs from '@domains/users/middlewares/auth'
import createAuditLog from '@domains/system/utils/createAuditLog'
import userRepository from '@domains/users/repositories/user'
import { paginateList } from '@factories/pagination'
import defineAction from '@factories/defineAction'
import { isValidObjectId } from '@database/utils'
import { formatDateKey } from '@utils/date'

import type { RegisterWorkoutSessionBody, ListWorkoutSessionsQuery, WorkoutSessionParams, WorkoutSummaryQuery } from './types'

export const registerWorkoutSessionAction = defineAction(
  {
    method: 'post',
    path: '/workouts/sessions/register',
    summary: 'Registra o check-in de um treino (feito ou faltou)',
    tags: ['Workouts'],
    authenticate: true,
    schema: { body: registerWorkoutSessionBodySchema },
    responses: {
      200: { description: 'Treino registrado', schema: workoutSessionResponseSchema },
      404: { description: 'Rotina não encontrada' }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const payload = data as RegisterWorkoutSessionBody
    if (payload.routineId && !isValidObjectId(payload.routineId)) return manageError({ code: 'bad_request' })

    const [routine, bodyMetrics] = await Promise.all([
      payload.routineId ? workoutRoutineRepository.findByIdAndUser(payload.routineId, ids.userId) : Promise.resolve(null),
      userRepository.findBodyMetrics(ids.userId)
    ])

    if (payload.routineId && !routine) return manageError({ code: 'not_found' })

    const modalityId = payload.modalityId || routine?.modalityId || 'other'
    const durationMinutes = payload.durationMinutes ?? routine?.durationMinutes ?? 60
    const caloriesBurned = payload.status === 'done'
      ? estimateCaloriesBurned({ modalityId, weightKg: bodyMetrics?.weight, durationMinutes, effort: payload.effort })
      : 0

    const saved = await workoutSessionRepository.save({
      userId: ids.userId,
      routineId: payload.routineId,
      date: payload.date || formatDateKey(new Date()),
      modalityId,
      name: payload.name || routine?.name || findModality(modalityId)?.name || 'Treino',
      status: payload.status,
      durationMinutes,
      distanceKm: payload.distanceKm ?? routine?.distanceKm,
      effort: payload.effort,
      exercises: payload.exercises || routine?.exercises || [],
      caloriesBurned,
      notes: payload.notes
    })

    await createAuditLog({
      actorId: ids.userId,
      action: 'register_workout_session',
      entity: 'WorkoutSession',
      entityId: String(saved.id),
      summary: payload.status === 'done' ? 'Treino marcado como feito.' : 'Treino marcado como não realizado.',
      details: { date: saved.date, routineId: payload.routineId, modalityId, status: payload.status }
    })

    return saved
  }
)

export const listWorkoutSessionsAction = defineAction(
  {
    method: 'get',
    path: '/workouts/sessions/list',
    summary: 'Lista o histórico de treinos do usuário',
    tags: ['Workouts'],
    authenticate: true,
    schema: { query: listWorkoutSessionsQuerySchema },
    responses: {
      200: { description: 'Histórico de treinos', schema: listWorkoutSessionsResponseSchema }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, query, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { page, limit, startDate, endDate } = (query || {}) as ListWorkoutSessionsQuery
    const sessions = await workoutSessionRepository.findAllByUser(ids.userId, { startDate, endDate })

    return paginateList(sessions, { page, limit })
  }
)

export const removeWorkoutSessionAction = defineAction(
  {
    method: 'delete',
    path: '/workouts/sessions/:id/remove',
    summary: 'Desfaz o check-in de um treino',
    tags: ['Workouts'],
    authenticate: true,
    schema: { params: workoutSessionParamsSchema },
    responses: {
      200: { description: 'Check-in removido', schema: workoutSessionIdResponseSchema },
      404: { description: 'Treino não encontrado' }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, params, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { id } = params as WorkoutSessionParams
    if (!isValidObjectId(id)) return manageError({ code: 'bad_request' })

    const removed = await workoutSessionRepository.delete(id, ids.userId)
    if (!removed) return manageError({ code: 'not_found' })

    await createAuditLog({
      actorId: ids.userId,
      action: 'remove_workout_session',
      entity: 'WorkoutSession',
      entityId: id,
      summary: 'Check-in de treino removido pelo usuário.'
    })

    return { id }
  }
)

export const getWorkoutSummaryAction = defineAction(
  {
    method: 'get',
    path: '/workouts/summary/details',
    summary: 'Resumo de frequência, aderência e gasto calórico no período',
    tags: ['Workouts'],
    authenticate: true,
    schema: { query: workoutSummaryQuerySchema },
    responses: {
      200: { description: 'Resumo de treinos', schema: workoutSummaryResponseSchema }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, query, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { startDate, endDate } = query as WorkoutSummaryQuery
    if (startDate > endDate) return manageError({ code: 'bad_request' })

    const [routines, sessions] = await Promise.all([
      workoutRoutineRepository.findAllByUser(ids.userId),
      workoutSessionRepository.findAllByUser(ids.userId)
    ])

    return calculateWorkoutSummary(routines, sessions, startDate, endDate, formatDateKey(new Date()))
  }
)
