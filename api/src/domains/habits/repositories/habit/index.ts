import { HabitModel } from '@domains/habits/repositories/habit/model'
import { toObjectId } from '@database/utils'

import type { HabitModelType, CreateHabitPayload, UpdateHabitPayload, ListHabitsFilters } from '@domains/habits/repositories/habit/types'

const habitRepository = {
  create: async (payload: CreateHabitPayload): Promise<HabitModelType> => {
    const hasTime = Boolean(payload.startTime && payload.startTime.trim())
    const created = await HabitModel.create({
      userId: toObjectId(payload.userId),
      title: payload.title,
      description: payload.description,
      category: payload.category || 'event',
      frequency: payload.frequency || 'daily',
      startDate: payload.startDate,
      allDay: payload.allDay !== undefined ? payload.allDay : !hasTime,
      startTime: hasTime ? payload.startTime?.trim() : undefined,
      endTime: hasTime && payload.endTime ? payload.endTime.trim() : undefined,
      recurrence: payload.recurrence,
      excludedDates: payload.excludedDates || [],
      active: true
    })
    return { ...created.toObject(), id: created._id.toString() } as unknown as HabitModelType
  },
  findById: async (id: string): Promise<HabitModelType | null> => {
    const habit = await HabitModel.findById(id).lean()
    if (!habit) return null
    return { ...habit, id: habit._id.toString() } as unknown as HabitModelType
  },
  findByIdAndUser: async (id: string, userId: string): Promise<HabitModelType | null> => {
    const habit = await HabitModel.findOne({ _id: toObjectId(id), userId: toObjectId(userId) }).lean()
    if (!habit) return null
    return { ...habit, id: habit._id.toString() } as unknown as HabitModelType
  },
  findAllByUser: async (userId: string, filters?: ListHabitsFilters): Promise<HabitModelType[]> => {
    const query: Record<string, unknown> = { userId: toObjectId(userId) }
    if (filters?.frequency) query.frequency = filters.frequency
    if (filters?.category) query.category = filters.category
    if (typeof filters?.active === 'boolean') query.active = filters.active

    const habits = await HabitModel.find(query).sort({ startTime: 1, createdAt: -1 }).lean()
    return habits.map((habit) => ({ ...habit, id: habit._id.toString() })) as unknown as HabitModelType[]
  },
  update: async (id: string, userId: string, payload: UpdateHabitPayload): Promise<HabitModelType | null> => {
    const updateData: Record<string, unknown> = { ...payload }

    if (payload.startTime !== undefined) {
      if (payload.startTime && payload.startTime.trim()) {
        updateData.startTime = payload.startTime.trim()
        updateData.allDay = payload.allDay !== undefined ? payload.allDay : false
      } else {
        updateData.startTime = null
        updateData.endTime = null
        updateData.allDay = true
      }
    }

    if (payload.endTime !== undefined) {
      updateData.endTime = payload.endTime && payload.endTime.trim() ? payload.endTime.trim() : null
    }

    const habit = await HabitModel.findOneAndUpdate(
      { _id: toObjectId(id), userId: toObjectId(userId) },
      updateData,
      { new: true }
    ).lean()
    if (!habit) return null
    return { ...habit, id: habit._id.toString() } as unknown as HabitModelType
  },
  delete: async (id: string, userId: string): Promise<boolean> => {
    const result = await HabitModel.deleteOne({ _id: toObjectId(id), userId: toObjectId(userId) })
    return result.deletedCount > 0
  }
}

export default habitRepository

