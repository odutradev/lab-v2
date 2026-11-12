import { listWorkoutRoutinesQuerySchema, listWorkoutRoutinesResponseSchema, createWorkoutRoutineBodySchema, updateWorkoutRoutineBodySchema, workoutRoutineResponseSchema, workoutRoutineParamsSchema, applyRoutineTemplateBodySchema, applyRoutineTemplateResponseSchema, workoutRoutineIdResponseSchema } from './schemas'
import workoutSessionRepository from '@domains/workouts/repositories/workoutSession'
import workoutRoutineRepository from '@domains/workouts/repositories/workoutRoutine'
import { RoutineTemplates, ExerciseLibrary } from '@domains/workouts/utils/catalog'
import authMiddlewareWithDocs from '@domains/users/middlewares/auth'
import createAuditLog from '@domains/system/utils/createAuditLog'
import { paginateList } from '@factories/pagination'
import defineAction from '@factories/defineAction'
import { isValidObjectId } from '@database/utils'

import type { ListWorkoutRoutinesQuery, CreateWorkoutRoutineBody, UpdateWorkoutRoutineBody, ApplyRoutineTemplateBody, WorkoutRoutineParams } from './types'

const findExerciseName = (exerciseId: string): string => {
  return ExerciseLibrary.find((exercise) => exercise.id === exerciseId)?.name || exerciseId
}

export const createWorkoutRoutineAction = defineAction(
  {
    method: 'post',
    path: '/workouts/routines/create',
    summary: 'Cria uma rotina de treino semanal',
    tags: ['Workouts'],
    authenticate: true,
    schema: { body: createWorkoutRoutineBodySchema },
    responses: {
      200: { description: 'Rotina criada', schema: workoutRoutineResponseSchema }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const payload = data as CreateWorkoutRoutineBody
    const created = await workoutRoutineRepository.create({ userId: ids.userId, ...payload })

    await createAuditLog({
      actorId: ids.userId,
      action: 'create_workout_routine',
      entity: 'WorkoutRoutine',
      entityId: String(created.id),
      summary: 'Rotina de treino criada pelo usuário.',
      details: { name: payload.name, modalityId: payload.modalityId, weekDays: payload.weekDays }
    })

    return created
  }
)

export const applyRoutineTemplateAction = defineAction(
  {
    method: 'post',
    path: '/workouts/routines/apply-template',
    summary: 'Cria as rotinas de um modelo pronto (ABC, PPL, etc.)',
    tags: ['Workouts'],
    authenticate: true,
    schema: { body: applyRoutineTemplateBodySchema },
    responses: {
      200: { description: 'Rotinas do modelo criadas', schema: applyRoutineTemplateResponseSchema },
      404: { description: 'Modelo não encontrado' }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { templateId } = data as ApplyRoutineTemplateBody
    const template = RoutineTemplates.find((item) => item.id === templateId)
    if (!template) return manageError({ code: 'not_found' })

    const userId = ids.userId
    const created = await workoutRoutineRepository.createMany(template.routines.map((routine) => ({
      userId,
      name: routine.name,
      modalityId: 'weightTraining',
      weekDays: routine.weekDays,
      durationMinutes: 60,
      exercises: routine.exercises.map((exercise) => ({ ...exercise, name: findExerciseName(exercise.exerciseId) }))
    })))

    const createdIds = created.map((routine) => String(routine.id))

    await createAuditLog({
      actorId: userId,
      action: 'apply_workout_template',
      entity: 'WorkoutRoutine',
      entityId: createdIds[0],
      summary: 'Modelo de treino aplicado pelo usuário.',
      details: { templateId, routineIds: createdIds }
    })

    return { ids: createdIds }
  }
)

export const listWorkoutRoutinesAction = defineAction(
  {
    method: 'get',
    path: '/workouts/routines/list',
    summary: 'Lista as rotinas de treino do usuário',
    tags: ['Workouts'],
    authenticate: true,
    schema: { query: listWorkoutRoutinesQuerySchema },
    responses: {
      200: { description: 'Lista de rotinas', schema: listWorkoutRoutinesResponseSchema }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, query, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { page, limit, isActive } = (query || {}) as ListWorkoutRoutinesQuery
    const routines = await workoutRoutineRepository.findAllByUser(ids.userId, isActive === undefined ? undefined : isActive === 'true')

    return paginateList(routines, { page, limit })
  }
)

export const updateWorkoutRoutineAction = defineAction(
  {
    method: 'patch',
    path: '/workouts/routines/:id/update',
    summary: 'Atualiza uma rotina de treino',
    tags: ['Workouts'],
    authenticate: true,
    schema: { params: workoutRoutineParamsSchema, body: updateWorkoutRoutineBodySchema },
    responses: {
      200: { description: 'Rotina atualizada', schema: workoutRoutineResponseSchema },
      404: { description: 'Rotina não encontrada' }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, params, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { id } = params as WorkoutRoutineParams
    if (!isValidObjectId(id)) return manageError({ code: 'bad_request' })

    const payload = data as UpdateWorkoutRoutineBody
    const updated = await workoutRoutineRepository.update(id, ids.userId, payload)
    if (!updated) return manageError({ code: 'not_found' })

    await createAuditLog({
      actorId: ids.userId,
      action: 'update_workout_routine',
      entity: 'WorkoutRoutine',
      entityId: id,
      summary: 'Rotina de treino atualizada pelo usuário.',
      details: payload
    })

    return updated
  }
)

export const removeWorkoutRoutineAction = defineAction(
  {
    method: 'delete',
    path: '/workouts/routines/:id/remove',
    summary: 'Remove uma rotina de treino',
    tags: ['Workouts'],
    authenticate: true,
    schema: { params: workoutRoutineParamsSchema },
    responses: {
      200: { description: 'Rotina removida', schema: workoutRoutineIdResponseSchema },
      404: { description: 'Rotina não encontrada' }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, params, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { id } = params as WorkoutRoutineParams
    if (!isValidObjectId(id)) return manageError({ code: 'bad_request' })

    const removed = await workoutRoutineRepository.delete(id, ids.userId)
    if (!removed) return manageError({ code: 'not_found' })

    await Promise.all([
      workoutSessionRepository.deleteByRoutine(id, ids.userId),
      createAuditLog({
        actorId: ids.userId,
        action: 'remove_workout_routine',
        entity: 'WorkoutRoutine',
        entityId: id,
        summary: 'Rotina de treino removida pelo usuário.'
      })
    ])

    return { id }
  }
)
