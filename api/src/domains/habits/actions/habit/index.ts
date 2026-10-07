import { removeHabitQuerySchema, habitActionSuccessResponseSchema, listHabitsResponseSchema, scheduleHabitBodySchema, removeHabitParamsSchema, updateHabitParamsSchema, updateHabitBodySchema, createHabitBodySchema, habitResponseSchema } from '@domains/habits/actions/habit/schemas'
import habitCheckinRepository from '@domains/habits/repositories/habitCheckin'
import authMiddlewareWithDocs from '@domains/users/middlewares/auth'
import habitRepository from '@domains/habits/repositories/habit'
import { isValidObjectId } from '@database/utils'
import defineAction from '@factories/defineAction'
import createAuditLog from '@createAuditLog'

import type { RemoveHabitQuery, ScheduleHabitBody, RemoveHabitParams, UpdateHabitParams, UpdateHabitBody, CreateHabitBody, ListHabitsQuery } from '@domains/habits/actions/habit/types'

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
    summary: 'Atualiza os dados de uma meta ou hábito com suporte a escopo de recorrência',
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

    const habit = await habitRepository.findByIdAndUser(id, ids.userId)
    if (!habit) return manageError({ code: 'not_found' })

    const { mode, date, ...updatePayload } = data as UpdateHabitBody
    const isRecurring = Boolean(habit.recurrence && habit.recurrence.type && habit.recurrence.type !== 'none')
    const targetMode = isRecurring && mode ? mode : 'all'

    if (targetMode === 'this' && date) {
      // 1. Adiciona a data no excludedDates da série original
      const currentExcluded = habit.excludedDates || []
      if (!currentExcluded.includes(date)) {
        await habitRepository.update(id, ids.userId, {
          excludedDates: [...currentExcluded, date]
        })
      }

      // 2. Cria uma nova instância pontual com as alterações para este dia específico
      const createdSingleInstance = await habitRepository.create({
        userId: ids.userId,
        title: updatePayload.title ?? habit.title,
        description: updatePayload.description !== undefined ? updatePayload.description : habit.description,
        category: updatePayload.category ?? habit.category,
        frequency: 'none',
        startDate: updatePayload.startDate ?? date,
        allDay: updatePayload.allDay !== undefined ? updatePayload.allDay : habit.allDay,
        startTime: updatePayload.startTime !== undefined ? updatePayload.startTime : habit.startTime,
        endTime: updatePayload.endTime !== undefined ? updatePayload.endTime : habit.endTime,
        recurrence: { type: 'none' }
      })

      await createAuditLog({
        actorId: ids.userId,
        action: 'update_habit_this_instance',
        entity: 'Habit',
        entityId: createdSingleInstance.id,
        summary: 'Instância pontual criada para evento recorrente.',
        details: { parentHabitId: id, date }
      })

      return createdSingleInstance
    }

    if (targetMode === 'following' && date) {
      const [y, m, d] = date.split('-').map(Number)
      const prev = new Date(y, m - 1, d - 1)
      const py = prev.getFullYear()
      const pm = String(prev.getMonth() + 1).padStart(2, '0')
      const pd = String(prev.getDate()).padStart(2, '0')
      const previousDate = `${py}-${pm}-${pd}`

      if (habit.startDate && habit.startDate >= date) {
        // Se a série original inicia nesta data ou depois, apenas atualiza
        const updated = await habitRepository.update(id, ids.userId, updatePayload)
        return updated
      } else {
        // 1. Encerra a série original no dia anterior
        await habitRepository.update(id, ids.userId, {
          recurrence: {
            ...(habit.recurrence || { type: 'daily' }),
            endType: 'on_date',
            endDate: previousDate
          }
        })

        // 2. Cria a nova série com os novos dados a partir de date
        const createdNewSeries = await habitRepository.create({
          userId: ids.userId,
          title: updatePayload.title ?? habit.title,
          description: updatePayload.description !== undefined ? updatePayload.description : habit.description,
          category: updatePayload.category ?? habit.category,
          frequency: updatePayload.frequency ?? habit.frequency,
          startDate: updatePayload.startDate ?? date,
          allDay: updatePayload.allDay !== undefined ? updatePayload.allDay : habit.allDay,
          startTime: updatePayload.startTime !== undefined ? updatePayload.startTime : habit.startTime,
          endTime: updatePayload.endTime !== undefined ? updatePayload.endTime : habit.endTime,
          recurrence: updatePayload.recurrence ?? habit.recurrence
        })

        await createAuditLog({
          actorId: ids.userId,
          action: 'update_habit_following_instances',
          entity: 'Habit',
          entityId: createdNewSeries.id,
          summary: 'Nova série de eventos recorrentes criada a partir de data.',
          details: { parentHabitId: id, splitDate: date }
        })

        return createdNewSeries
      }
    }

    // Modo 'all' ou evento pontual: atualiza normalmente
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
    summary: 'Remove uma meta/hábito com suporte a escopo de recorrência (este, este e seguintes, todos)',
    tags: ['Habits'],
    authenticate: true,
    schema: {
      params: removeHabitParamsSchema,
      query: removeHabitQuerySchema
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
  async ({ ids, params, query, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { id } = params as RemoveHabitParams
    const { mode, date } = (query || {}) as RemoveHabitQuery
    if (!isValidObjectId(id)) return manageError({ code: 'bad_request' })

    const habit = await habitRepository.findByIdAndUser(id, ids.userId)
    if (!habit) return manageError({ code: 'not_found' })

    const isRecurring = Boolean(habit.recurrence && habit.recurrence.type && habit.recurrence.type !== 'none')
    const targetMode = isRecurring && mode ? mode : 'all'

    if (targetMode === 'this' && date) {
      // Excluir apenas ESTE evento naquela data
      const currentExcluded = habit.excludedDates || []
      if (!currentExcluded.includes(date)) {
        await habitRepository.update(id, ids.userId, {
          excludedDates: [...currentExcluded, date]
        })
      }
      await habitCheckinRepository.deleteByUserHabitAndDate(ids.userId, id, date)

      await createAuditLog({
        actorId: ids.userId,
        action: 'remove_habit_this_instance',
        entity: 'Habit',
        entityId: id,
        summary: 'Ocorrência pontual excluída de evento recorrente.',
        details: { date }
      })

      return { success: true }
    }

    if (targetMode === 'following' && date) {
      // Excluir ESTE E OS SEGUINTES
      const [y, m, d] = date.split('-').map(Number)
      const prev = new Date(y, m - 1, d - 1)
      const py = prev.getFullYear()
      const pm = String(prev.getMonth() + 1).padStart(2, '0')
      const pd = String(prev.getDate()).padStart(2, '0')
      const previousDate = `${py}-${pm}-${pd}`

      if (habit.startDate && habit.startDate >= date) {
        // Se começava nesta data ou depois, exclui tudo
        await habitRepository.delete(id, ids.userId)
        await habitCheckinRepository.deleteByHabitId(id)
      } else {
        await habitRepository.update(id, ids.userId, {
          recurrence: {
            ...(habit.recurrence || { type: 'daily' }),
            endType: 'on_date',
            endDate: previousDate
          }
        })
        await habitCheckinRepository.deleteByUserHabitAndDateFrom(ids.userId, id, date)
      }

      await createAuditLog({
        actorId: ids.userId,
        action: 'remove_habit_following_instances',
        entity: 'Habit',
        entityId: id,
        summary: 'Eventos recorrentes encerrados a partir de data.',
        details: { cutoffDate: date }
      })

      return { success: true }
    }

    // Modo 'all': remove o hábito completo
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
