import { WorkoutSessionModel } from '@domains/workouts/repositories/workoutSession/model'
import { toObjectId } from '@database/utils'

import type { WorkoutSessionModelType, SaveWorkoutSessionPayload, ListWorkoutSessionsFilters } from '@domains/workouts/repositories/workoutSession/types'

const toSession = (document: object & { _id: { toString: () => string }, routineId?: { toString: () => string } }): WorkoutSessionModelType => {
  return { ...document, id: document._id.toString(), routineId: document.routineId?.toString() } as unknown as WorkoutSessionModelType
}

const buildDateQuery = (filters?: ListWorkoutSessionsFilters) => {
  if (!filters?.startDate && !filters?.endDate) return {}
  return {
    date: {
      ...(filters.startDate && { $gte: filters.startDate }),
      ...(filters.endDate && { $lte: filters.endDate })
    }
  }
}

const buildSessionData = (payload: SaveWorkoutSessionPayload) => ({
  userId: toObjectId(payload.userId),
  routineId: payload.routineId ? toObjectId(payload.routineId) : undefined,
  date: payload.date,
  modalityId: payload.modalityId,
  name: payload.name.trim(),
  status: payload.status,
  durationMinutes: payload.durationMinutes,
  distanceKm: payload.distanceKm,
  effort: payload.effort,
  exercises: payload.exercises,
  caloriesBurned: payload.caloriesBurned,
  notes: payload.notes?.trim() || undefined
})

const workoutSessionRepository = {
  save: async (payload: SaveWorkoutSessionPayload): Promise<WorkoutSessionModelType> => {
    if (!payload.routineId) {
      const created = await WorkoutSessionModel.create(buildSessionData(payload))
      return toSession(created.toObject())
    }

    const saved = await WorkoutSessionModel.findOneAndUpdate(
      { userId: toObjectId(payload.userId), routineId: toObjectId(payload.routineId), date: payload.date },
      buildSessionData(payload),
      { new: true, upsert: true }
    ).lean()

    return toSession(saved)
  },

  findAllByUser: async (userId: string, filters?: ListWorkoutSessionsFilters): Promise<WorkoutSessionModelType[]> => {
    const sessions = await WorkoutSessionModel.find({ userId: toObjectId(userId), ...buildDateQuery(filters) })
      .sort({ date: -1, createdAt: -1 })
      .lean()
    return sessions.map(toSession)
  },

  sumCaloriesByDate: async (userId: string, date: string): Promise<number> => {
    const sessions = await WorkoutSessionModel.find({ userId: toObjectId(userId), date, status: 'done' }).select('caloriesBurned').lean()
    return sessions.reduce((total, session) => total + (session.caloriesBurned || 0), 0)
  },

  delete: async (id: string, userId: string): Promise<boolean> => {
    const result = await WorkoutSessionModel.deleteOne({ _id: toObjectId(id), userId: toObjectId(userId) })
    return result.deletedCount > 0
  },

  deleteByRoutine: async (routineId: string, userId: string): Promise<number> => {
    const result = await WorkoutSessionModel.deleteMany({ routineId: toObjectId(routineId), userId: toObjectId(userId), status: 'missed' })
    return result.deletedCount
  }
}

export default workoutSessionRepository
