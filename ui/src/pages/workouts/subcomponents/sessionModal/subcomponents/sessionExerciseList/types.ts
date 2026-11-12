import type { RoutineExercise } from "@actions/workouts/types";

export interface SessionExerciseListProps {
  exercises: RoutineExercise[];
  onChange: (exercises: RoutineExercise[]) => void;
}
