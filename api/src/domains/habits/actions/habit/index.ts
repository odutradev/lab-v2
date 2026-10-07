import { habitActionSuccessResponseSchema, listHabitsResponseSchema, scheduleHabitBodySchema, removeHabitParamsSchema, updateHabitParamsSchema, updateHabitBodySchema, createHabitBodySchema, habitResponseSchema } from '@domains/habits/actions/habit/schemas'
import habitCheckinRepository from '@domains/habits/repositories/habitCheckin'
import authMiddlewareWithDocs from '@domains/users/middlewares/auth'
import habitRepository from '@domains/habits/repositories/habit'
import { isValidObjectId } from '@database/utils'
import defineAction from '@factories/defineAction'
import createAuditLog from '@createAuditLog'

import type { ScheduleHabitBody, RemoveHabitParams, UpdateHabitParams, UpdateHabitBody, CreateHabitBody, ListHabitsQuery } from '@domains/habits/actions/habit/types'

export const createHabitAction = defineAction(
  {
    method: 'post',
    path: '/habits/create',
    summary: 'Cria uma nova meta/hábito diário, semanal ou mensal',
    tags: ['Habits'],
    authenticate: true,
    schema: {
      body: createHabitBodySchema
    },
    responses: {
      200: {
        description: 'Meta/hábito criado com sucesso',
        schema: habitResponseSchema
      }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const {
      title,
      description,
      category,
      frequency,
      startDate,
      allDay,
      startTime,
      endTime,
      recurrence
    } = data as CreateHabitBody

    const createdHabit = await habitRepository.create({
      userId: ids.userId,
      title,
      description,
      category,
      frequency,
      startDate,
      allDay,
      startTime,
      endTime,
      recurrence
    })

    await createAuditLog({
      actorId: ids.userId,
      action: 'create_habit',
      entity: 'Habit',
      entityId: createdHabit.id,
      summary: 'Hábito criado pelo usuário.',
      details: { title, frequency, category, startTime, recurrence }
    })

    return createdHabit
  }
)

export const listHabitsAction = defineAction(
  {
    method: 'get',
    path: '/habits/list',
    summary: 'Lista os hábitos e metas do usuário autenticado',
    tags: ['Habits'],
    authenticate: true,
    responses: {
      200: {
        description: 'Lista de hábitos cadastrados',
        schema: listHabitsResponseSchema
      }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, query, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const parsedQuery = query as ListHabitsQuery
    const habits = await habitRepository.findAllByUser(ids.userId, parsedQuery)

    return habits
  }
)

export const updateHabitAction = defineAction(
  {
    method: 'patch',
    path: '/habits/:id/update',
    summary: 'Atualiza os dados de uma meta ou hábito',
    tags: ['Habits'],
    authenticate: true,
    schema: {
      params: updateHabitParamsSchema,
      body: updateHabitBodySchema
    },
    responses: {
      200: {
        description: 'Hábito atualizado com sucesso',
        schema: habitResponseSchema
      },
      404: {
        description: 'Hábito não localizado'
      }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, params, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { id } = params as UpdateHabitParams
    if (!isValidObjectId(id)) return manageError({ code: 'bad_request' })

    const updatePayload = data as UpdateHabitBody
    const updated = await habitRepository.update(id, ids.userId, updatePayload)
    if (!updated) return manageError({ code: 'not_found' })

    await createAuditLog({
      actorId: ids.userId,
      action: 'update_habit',
      entity: 'Habit',
      entityId: id,
      summary: 'Hábito atualizado pelo usuário.',
      details: updatePayload
    })

    return updated
  }
)

export const removeHabitAction = defineAction(
  {
    method: 'delete',
    path: '/habits/:id/remove',
    summary: 'Remove uma meta/hábito e seus registros associados',
    tags: ['Habits'],
    authenticate: true,
    schema: {
      params: removeHabitParamsSchema
    },
    responses: {
      200: {
        description: 'Hábito removido com sucesso',
        schema: habitActionSuccessResponseSchema
      },
      404: {
        description: 'Hábito não localizado'
      }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, params, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { id } = params as RemoveHabitParams
    if (!isValidObjectId(id)) return manageError({ code: 'bad_request' })

    const removed = await habitRepository.delete(id, ids.userId)
    if (!removed) return manageError({ code: 'not_found' })

    await habitCheckinRepository.deleteByHabitId(id)

    await createAuditLog({
      actorId: ids.userId,
      action: 'remove_habit',
      entity: 'Habit',
      entityId: id,
      summary: 'Hábito e checkins removidos pelo usuário.'
    })

    return { success: true }
  }
)

export const scheduleHabitAction = defineAction(
  {
    method: 'post',
    path: '/habits/schedule-day',
    summary: 'Agenda ou inclui um hábito na checklist de uma data específica',
    tags: ['Habits'],
    authenticate: true,
    schema: {
      body: scheduleHabitBodySchema
    },
    responses: {
      200: {
        description: 'Hábito agendado para o dia',
        schema: habitActionSuccessResponseSchema
      },
      404: {
        description: 'Hábito não localizado'
      }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { habitId, date } = data as ScheduleHabitBody
    if (!isValidObjectId(habitId)) return manageError({ code: 'bad_request' })

    const habit = await habitRepository.findByIdAndUser(habitId, ids.userId)
    if (!habit) return manageError({ code: 'not_found' })

    const existingCheckin = await habitCheckinRepository.findByUserHabitAndDate(ids.userId, habitId, date)
    if (!existingCheckin) {
      await habitCheckinRepository.upsertCheckin({
        userId: ids.userId,
        habitId,
        date,
        completed: false
      })
    }

    return { success: true }
  }
)
