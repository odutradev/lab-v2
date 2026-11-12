import type { WorkoutRoutine } from "@actions/workouts/types";

export interface RoutineRemovalState {
  routine: WorkoutRoutine | null;
  isRemoving: boolean;
}
