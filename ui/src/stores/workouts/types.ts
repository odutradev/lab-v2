import type { WorkoutCatalog, WorkoutRoutine, WorkoutSession, WorkoutSummary } from "@actions/workouts/types";

export interface SessionDraft {
  date: string;
  routine?: WorkoutRoutine;
  session?: WorkoutSession;
}

export interface WorkoutsState {
  catalog: WorkoutCatalog | null;
  routines: WorkoutRoutine[];
  sessions: WorkoutSession[];
  summary: WorkoutSummary | null;
  weekStart: string;
  isLoading: boolean;
  routineFormTarget: WorkoutRoutine | "new" | null;
  sessionDraft: SessionDraft | null;
  setCatalog: (catalog: WorkoutCatalog) => void;
  setRoutines: (routines: WorkoutRoutine[]) => void;
  setSessions: (sessions: WorkoutSession[]) => void;
  setSummary: (summary: WorkoutSummary) => void;
  setWeekStart: (weekStart: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  upsertRoutine: (routine: WorkoutRoutine) => void;
  dropRoutine: (id: string) => void;
  upsertSession: (session: WorkoutSession) => void;
  dropSession: (id: string) => void;
  setRoutineFormTarget: (target: WorkoutRoutine | "new" | null) => void;
  setSessionDraft: (draft: SessionDraft | null) => void;
}
