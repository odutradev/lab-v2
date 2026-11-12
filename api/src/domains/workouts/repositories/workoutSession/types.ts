import type { HydratedDocument, Document, Types } from 'mongoose'

import type { RoutineExercise } from '@domains/workouts/repositories/workoutRoutine/types'

export type WorkoutSessionStatus = 'done' | 'missed'

export interface WorkoutSession {
  userId: Types.ObjectId | string
  routineId?: Types.ObjectId | string
  date: string
  modalityId: string
  name: string
  status: WorkoutSessionStatus
  durationMinutes?: number
  distanceKm?: number
  effort?: number
  exercises: RoutineExercise[]
  caloriesBurned: number
  notes?: string
}

export interface WorkoutSessionDocument extends WorkoutSession, Document {
  createdAt: Date
  updatedAt: Date
}

export type WorkoutSessionModelType = HydratedDocument<WorkoutSessionDocument>

export interface SaveWorkoutSessionPayload {
  userId: string
  routineId?: string
  date: string
  modalityId: string
  name: string
  status: WorkoutSessionStatus
  durationMinutes?: number
  distanceKm?: number
  effort?: number
  exercises: RoutineExercise[]
  caloriesBurned: number
  notes?: string
}

export interface ListWorkoutSessionsFilters {
  startDate?: string
  endDate?: string
}
