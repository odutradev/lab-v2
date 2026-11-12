import type { HydratedDocument, Document, Types } from 'mongoose'

export interface RoutineExercise {
  exerciseId?: string
  name: string
  sets: number
  reps: string
  load?: number
  restSeconds?: number
}

export interface WorkoutRoutine {
  userId: Types.ObjectId | string
  name: string
  modalityId: string
  weekDays: number[]
  exercises: RoutineExercise[]
  durationMinutes?: number
  distanceKm?: number
  notes?: string
  isActive: boolean
}

export interface WorkoutRoutineDocument extends WorkoutRoutine, Document {
  createdAt: Date
  updatedAt: Date
}

export type WorkoutRoutineModelType = HydratedDocument<WorkoutRoutineDocument>

export interface CreateWorkoutRoutinePayload {
  userId: string
  name: string
  modalityId: string
  weekDays: number[]
  exercises?: RoutineExercise[]
  durationMinutes?: number
  distanceKm?: number
  notes?: string
}

export interface UpdateWorkoutRoutinePayload {
  name?: string
  modalityId?: string
  weekDays?: number[]
  exercises?: RoutineExercise[]
  durationMinutes?: number
  distanceKm?: number
  notes?: string
  isActive?: boolean
}
