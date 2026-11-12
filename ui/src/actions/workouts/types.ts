export type WorkoutModalityKind = "strength" | "cardio" | "sport";

export type MuscleGroup = "chest" | "back" | "shoulders" | "biceps" | "triceps" | "legs" | "glutes" | "calves" | "core";

export type WorkoutSessionStatus = "done" | "missed";

export interface WorkoutModality {
  id: string;
  name: string;
  kind: WorkoutModalityKind;
  met: number;
}

export interface LibraryExercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
}

export interface RoutineTemplate {
  id: string;
  name: string;
  routines: Array<{
    name: string;
    weekDays: number[];
    exercises: Array<{ exerciseId: string; sets: number; reps: string }>;
  }>;
}

export interface WorkoutCatalog {
  modalities: WorkoutModality[];
  exercises: LibraryExercise[];
  templates: RoutineTemplate[];
}

export interface RoutineExercise {
  exerciseId?: string;
  name: string;
  sets: number;
  reps: string;
  load?: number;
  restSeconds?: number;
}

export interface WorkoutRoutine {
  id: string;
  userId: string;
  name: string;
  modalityId: string;
  weekDays: number[];
  exercises: RoutineExercise[];
  durationMinutes?: number;
  distanceKm?: number;
  notes?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWorkoutRoutinePayload {
  name: string;
  modalityId: string;
  weekDays: number[];
  exercises?: RoutineExercise[];
  durationMinutes?: number;
  distanceKm?: number;
  notes?: string;
}

export interface UpdateWorkoutRoutinePayload extends Partial<CreateWorkoutRoutinePayload> {
  isActive?: boolean;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  routineId?: string;
  date: string;
  modalityId: string;
  name: string;
  status: WorkoutSessionStatus;
  durationMinutes?: number;
  distanceKm?: number;
  effort?: number;
  exercises: RoutineExercise[];
  caloriesBurned: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterWorkoutSessionPayload {
  routineId?: string;
  date?: string;
  status: WorkoutSessionStatus;
  modalityId?: string;
  name?: string;
  durationMinutes?: number;
  distanceKm?: number;
  effort?: number;
  exercises?: RoutineExercise[];
  notes?: string;
}

export interface ListWorkoutSessionsParams {
  startDate?: string;
  endDate?: string;
}

export interface WorkoutSummary {
  plannedCount: number;
  donePlannedCount: number;
  doneCount: number;
  missedCount: number;
  adherenceRate: number;
  totalMinutes: number;
  totalCalories: number;
  totalDistanceKm: number;
  currentStreak: number;
  modalities: Array<{ modalityId: string; count: number; minutes: number }>;
}

export interface WorkoutIdResponse {
  id: string;
}

export interface WorkoutIdsResponse {
  ids: string[];
}
