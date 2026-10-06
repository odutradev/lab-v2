import { toggleCheckinResponseSchema, daySummaryResponseSchema, toggleCheckinBodySchema, daySummaryQuerySchema } from '@domains/habits/actions/checkin/schemas'
import habitCheckinRepository from '@domains/habits/repositories/habitCheckin'
import authMiddlewareWithDocs from '@domains/users/middlewares/auth'
import habitRepository from '@domains/habits/repositories/habit'
import { formatTimestamp } from '@utils/date'
import { isValidObjectId } from '@database/utils'
import defineAction from '@factories/defineAction'
import createAuditLog from '@createAuditLog'

import type { ToggleCheckinResponse, DaySummaryResponse, ToggleCheckinBody, DaySummaryQuery, DaySummaryItem } from '@domains/habits/actions/checkin/types'

export const toggleCheckinAction = defineAction(
  {
    method: 'post',
    path: '/habits/checkins/toggle',
    summary: 'Marca ou desmarca a conclusão de uma meta/hábito para uma data',
    tags: ['Habits'],
    authenticate: true,
    schema: {
      body: toggleCheckinBodySchema
    },
    responses: {
      200: {
        description: 'Status de conclusão do hábito atualizado',
        schema: toggleCheckinResponseSchema
      },
      404: {
        description: 'Hábito não localizado'
      }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { habitId, date, completed } = data as ToggleCheckinBody
    if (!isValidObjectId(habitId)) return manageError({ code: 'bad_request' })

    const habit = await habitRepository.findByIdAndUser(habitId, ids.userId)
    if (!habit) return manageError({ code: 'not_found' })

    const targetDate = date || formatTimestamp().split(' ')[0]
    const existingCheckin = await habitCheckinRepository.findByUserHabitAndDate(ids.userId, habitId, targetDate)

    const nextCompleted = typeof completed === 'boolean'
      ? completed
      : existingCheckin
        ? !existingCheckin.completed
        : true

    await habitCheckinRepository.upsertCheckin({
      userId: ids.userId,
      habitId,
      date: targetDate,
      completed: nextCompleted
    })

    await createAuditLog({
      actorId: ids.userId,
      action: 'toggle_habit_checkin',
      entity: 'HabitCheckin',
      entityId: habitId,
      summary: 'Status do hábito modificado para a data.',
      details: { habitId, date: targetDate, completed: nextCompleted }
    })

    return {
      habitId,
      date: targetDate,
      completed: nextCompleted
    }
  }
)

export const getDaySummaryAction = defineAction(
  {
    method: 'get',
    path: '/habits/day-summary',
    summary: 'Calcula o resumo diário e taxa de aproveitamento das metas na data',
    tags: ['Habits'],
    authenticate: true,
    schema: {
      query: daySummaryQuerySchema
    },
    responses: {
      200: {
        description: 'Resumo e índice de aproveitamento do dia',
        schema: daySummaryResponseSchema
      }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, query, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const parsedQuery = query as DaySummaryQuery
    const targetDate = parsedQuery.date || formatTimestamp().split(' ')[0]

    const activeHabits = await habitRepository.findAllByUser(ids.userId, { active: true })
    const checkins = await habitCheckinRepository.findByUserAndDate(ids.userId, targetDate)

    const checkinMap = new Map(checkins.map((item) => [item.habitId.toString(), item.completed]))

    const items: DaySummaryItem[] = activeHabits
      .filter((habit) => {
        if (habit.frequency === 'daily') return true
        return checkinMap.has(habit.id.toString())
      })
      .map((habit) => {
        const habitId = habit.id.toString()
        const completed = checkinMap.get(habitId) ?? false

        return {
          habitId,
          title: habit.title,
          description: habit.description,
          frequency: habit.frequency,
          completed
        }
      })

    const totalHabits = items.length
    const completedHabits = items.filter((item) => item.completed).length
    const completionRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0

    const summary: DaySummaryResponse = {
      date: targetDate,
      totalHabits,
      completedHabits,
      completionRate,
      items
    }

    return summary
  }
)
