export type WorkoutModalityKind = 'strength' | 'cardio' | 'sport'

export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'legs' | 'glutes' | 'calves' | 'core'

export interface WorkoutModality {
  id: string
  name: string
  kind: WorkoutModalityKind
  met: number
}

export interface LibraryExercise {
  id: string
  name: string
  muscleGroup: MuscleGroup
}

export interface RoutineTemplateExercise {
  exerciseId: string
  sets: number
  reps: string
}

export interface RoutineTemplateItem {
  name: string
  weekDays: number[]
  exercises: RoutineTemplateExercise[]
}

export interface RoutineTemplate {
  id: string
  name: string
  routines: RoutineTemplateItem[]
}

export interface CaloriesEstimateInput {
  modalityId: string
  weightKg?: number
  durationMinutes?: number
  effort?: number
}
