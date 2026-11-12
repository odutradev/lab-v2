import { WorkoutRoutineModel } from '@domains/workouts/repositories/workoutRoutine/model'
import { toObjectId } from '@database/utils'

import type { WorkoutRoutineModelType, CreateWorkoutRoutinePayload, UpdateWorkoutRoutinePayload } from '@domains/workouts/repositories/workoutRoutine/types'

const toRoutine = (document: object & { _id: { toString: () => string } }): WorkoutRoutineModelType => {
  return { ...document, id: document._id.toString() } as unknown as WorkoutRoutineModelType
}

const normalizeWeekDays = (weekDays: number[]): number[] => {
  return [...new Set(weekDays)].sort((first, second) => first - second)
}

const workoutRoutineRepository = {
  create: async (payload: CreateWorkoutRoutinePayload): Promise<WorkoutRoutineModelType> => {
    const created = await WorkoutRoutineModel.create({
      userId: toObjectId(payload.userId),
      name: payload.name.trim(),
      modalityId: payload.modalityId,
      weekDays: normalizeWeekDays(payload.weekDays),
      exercises: payload.exercises || [],
      durationMinutes: payload.durationMinutes,
      distanceKm: payload.distanceKm,
      notes: payload.notes?.trim() || undefined,
      isActive: true
    })

    return toRoutine(created.toObject())
  },

  createMany: async (payloads: CreateWorkoutRoutinePayload[]): Promise<WorkoutRoutineModelType[]> => {
    const created = await WorkoutRoutineModel.insertMany(payloads.map((payload) => ({
      userId: toObjectId(payload.userId),
      name: payload.name.trim(),
      modalityId: payload.modalityId,
      weekDays: normalizeWeekDays(payload.weekDays),
      exercises: payload.exercises || [],
      durationMinutes: payload.durationMinutes,
      isActive: true
    })))

    return created.map((document) => toRoutine(document.toObject()))
  },

  findByIdAndUser: async (id: string, userId: string): Promise<WorkoutRoutineModelType | null> => {
    const routine = await WorkoutRoutineModel.findOne({ _id: toObjectId(id), userId: toObjectId(userId) }).lean()
    if (!routine) return null
    return toRoutine(routine)
  },

  findAllByUser: async (userId: string, isActive?: boolean): Promise<WorkoutRoutineModelType[]> => {
    const query = isActive === undefined ? { userId: toObjectId(userId) } : { userId: toObjectId(userId), isActive }
    const routines = await WorkoutRoutineModel.find(query).sort({ createdAt: 1 }).lean()
    return routines.map(toRoutine)
  },

  update: async (id: string, userId: string, payload: UpdateWorkoutRoutinePayload): Promise<WorkoutRoutineModelType | null> => {
    const updateData = {
      ...payload,
      ...(payload.name !== undefined && { name: payload.name.trim() }),
      ...(payload.notes !== undefined && { notes: payload.notes.trim() || undefined }),
      ...(payload.weekDays !== undefined && { weekDays: normalizeWeekDays(payload.weekDays) })
    }

    const updated = await WorkoutRoutineModel.findOneAndUpdate(
      { _id: toObjectId(id), userId: toObjectId(userId) },
      updateData,
      { new: true }
    ).lean()

    if (!updated) return null
    return toRoutine(updated)
  },

  delete: async (id: string, userId: string): Promise<boolean> => {
    const result = await WorkoutRoutineModel.deleteOne({ _id: toObjectId(id), userId: toObjectId(userId) })
    return result.deletedCount > 0
  }
}

export default workoutRoutineRepository
