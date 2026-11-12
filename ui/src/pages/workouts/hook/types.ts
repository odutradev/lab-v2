import type {
  WorkoutCatalog,
  WorkoutModality,
  WorkoutRoutine,
  WorkoutSession,
  WorkoutSummary,
  CreateWorkoutRoutinePayload,
  RegisterWorkoutSessionPayload,
  WorkoutSessionStatus
} from "@actions/workouts/types";
import type { SessionDraft } from "@stores/workouts/types";

export interface UseWorkoutsPageReturn {
  catalog: WorkoutCatalog | null;
  routines: WorkoutRoutine[];
  sessions: WorkoutSession[];
  summary: WorkoutSummary | null;
  isLoading: boolean;
  todayKey: string;
  weekStart: string;
  weekDates: string[];
  routineFormTarget: WorkoutRoutine | "new" | null;
  sessionDraft: SessionDraft | null;
  findModality: (modalityId: string) => WorkoutModality | undefined;
  loadPage: () => Promise<void>;
  handleChangeWeek: (offsetWeeks: number) => Promise<void>;
  handleQuickCheckin: (routine: WorkoutRoutine, date: string, status: WorkoutSessionStatus) => Promise<void>;
  handleUndoSession: (session: WorkoutSession) => Promise<void>;
  openSessionModal: (draft: SessionDraft) => void;
  closeSessionModal: () => void;
  handleSaveSession: (payload: RegisterWorkoutSessionPayload) => Promise<boolean>;
  openRoutineForm: (target: WorkoutRoutine | "new") => void;
  closeRoutineForm: () => void;
  handleSaveRoutine: (payload: CreateWorkoutRoutinePayload) => Promise<boolean>;
  handleRemoveRoutine: (routine: WorkoutRoutine) => Promise<void>;
  handleToggleRoutineActive: (routine: WorkoutRoutine) => Promise<void>;
  handleApplyTemplate: (templateId: string) => Promise<void>;
}
