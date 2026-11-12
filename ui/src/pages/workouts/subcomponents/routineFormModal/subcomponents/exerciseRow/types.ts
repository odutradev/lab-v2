import type { RoutineExercise } from "@actions/workouts/types";

export interface ExerciseRowProps {
  exercise: RoutineExercise;
  index: number;
  exerciseOptions: Array<{ group: string; items: string[] }>;
  error?: string;
  onChange: (index: number, exercise: RoutineExercise) => void;
  onRemove: (index: number) => void;
}
