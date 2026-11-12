import { Schema, model } from 'mongoose'

import type { WorkoutRoutineDocument } from '@domains/workouts/repositories/workoutRoutine/types'

const routineExerciseSchema = new Schema(
  {
    exerciseId: { type: String, required: false },
    name: { type: String, required: true, trim: true },
    sets: { type: Number, required: true, min: 1 },
    reps: { type: String, required: true, trim: true },
    load: { type: Number, required: false },
    restSeconds: { type: Number, required: false }
  },
  { _id: false }
)

const workoutRoutineSchema = new Schema<WorkoutRoutineDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    modalityId: { type: String, required: true },
    weekDays: { type: [Number], default: [] },
    exercises: { type: [routineExerciseSchema], default: [] },
    durationMinutes: { type: Number, required: false },
    distanceKm: { type: Number, required: false },
    notes: { type: String, required: false },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

workoutRoutineSchema.index({ userId: 1, isActive: 1 })

export const WorkoutRoutineModel = model<WorkoutRoutineDocument>('WorkoutRoutine', workoutRoutineSchema)
