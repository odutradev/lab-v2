import { Schema, model } from 'mongoose'

import type { WorkoutSessionDocument } from '@domains/workouts/repositories/workoutSession/types'

const sessionExerciseSchema = new Schema(
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

const workoutSessionSchema = new Schema<WorkoutSessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    routineId: { type: Schema.Types.ObjectId, ref: 'WorkoutRoutine', required: false },
    date: { type: String, required: true },
    modalityId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    status: { type: String, enum: ['done', 'missed'], required: true },
    durationMinutes: { type: Number, required: false },
    distanceKm: { type: Number, required: false },
    effort: { type: Number, required: false, min: 1, max: 10 },
    exercises: { type: [sessionExerciseSchema], default: [] },
    caloriesBurned: { type: Number, default: 0 },
    notes: { type: String, required: false }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

workoutSessionSchema.index({ userId: 1, date: -1 })
workoutSessionSchema.index({ userId: 1, routineId: 1, date: 1 })

export const WorkoutSessionModel = model<WorkoutSessionDocument>('WorkoutSession', workoutSessionSchema)
