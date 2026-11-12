import type { WorkoutRoutine, WorkoutSession } from "@actions/workouts/types";

export interface PlannedItem {
  routine: WorkoutRoutine;
  session?: WorkoutSession;
}
