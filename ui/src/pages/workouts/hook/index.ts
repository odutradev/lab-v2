import { useCallback, useMemo } from "react";

import {
  getWorkoutCatalogAction,
  listWorkoutRoutinesAction,
  listWorkoutSessionsAction,
  getWorkoutSummaryAction,
  registerWorkoutSessionAction,
  removeWorkoutSessionAction,
  createWorkoutRoutineAction,
  updateWorkoutRoutineAction,
  removeWorkoutRoutineAction,
  applyRoutineTemplateAction
} from "@actions/workouts";
import useWorkoutsStore from "@stores/workouts";
import useAction from "@hooks/useAction";
import { addDaysToDateString, getTodayDateString } from "@utils/functions/challenges";
import { getWeekDates, getMonthRange } from "@utils/functions/workouts";

import type {
  WorkoutRoutine,
  WorkoutSession,
  WorkoutSessionStatus,
  CreateWorkoutRoutinePayload,
  RegisterWorkoutSessionPayload
} from "@actions/workouts/types";
import type { SessionDraft } from "@stores/workouts/types";
import type { UseWorkoutsPageReturn } from "./types";

export const useWorkoutsPage = (): UseWorkoutsPageReturn => {
  const store = useWorkoutsStore();
  const runAction = useAction();
  const todayKey = getTodayDateString();
  const weekDates = useMemo(() => getWeekDates(store.weekStart), [store.weekStart]);

  const modalitiesById = useMemo(
    () => new Map((store.catalog?.modalities || []).map((modality) => [modality.id, modality])),
    [store.catalog]
  );

  const findModality = useCallback((modalityId: string) => modalitiesById.get(modalityId), [modalitiesById]);

  const refreshSummary = useCallback(async () => {
    const { startDate, endDate } = getMonthRange();
    const summary = await getWorkoutSummaryAction(startDate, endDate).catch(() => null);
    if (summary) useWorkoutsStore.getState().setSummary(summary);
  }, []);

  const loadWeekSessions = useCallback(async (weekStart: string) => {
    const sessions = await listWorkoutSessionsAction({
      startDate: weekStart,
      endDate: addDaysToDateString(weekStart, 6)
    });
    useWorkoutsStore.getState().setSessions(sessions);
  }, []);

  const loadPage = useCallback(async () => {
    const { weekStart, setIsLoading, setCatalog, setRoutines } = useWorkoutsStore.getState();
    setIsLoading(true);
    await runAction({
      action: () =>
        Promise.all([
          getWorkoutCatalogAction(),
          listWorkoutRoutinesAction(),
          loadWeekSessions(weekStart),
          refreshSummary()
        ]),
      toastMessages: { error: "Não foi possível carregar seus treinos.", errorTitle: "Treinos" },
      callback: ([catalog, routines]) => {
        setCatalog(catalog);
        setRoutines(routines);
      }
    });
    setIsLoading(false);
  }, [runAction, loadWeekSessions, refreshSummary]);

  const handleChangeWeek = useCallback(
    async (offsetWeeks: number) => {
      const nextWeekStart = addDaysToDateString(store.weekStart, offsetWeeks * 7);
      store.setWeekStart(nextWeekStart);
      await runAction({
        action: () => loadWeekSessions(nextWeekStart),
        toastMessages: { error: "Não foi possível carregar a semana.", errorTitle: "Treinos" }
      });
    },
    [store, runAction, loadWeekSessions]
  );

  const handleQuickCheckin = useCallback(
    async (routine: WorkoutRoutine, date: string, status: WorkoutSessionStatus) => {
      await runAction({
        action: () => registerWorkoutSessionAction({ routineId: routine.id, date, status }),
        toastMessages: {
          success: status === "done" ? "Treino registrado. Bora!" : "Falta registrada.",
          successType: status === "done" ? "success" : "info",
          error: "Não foi possível registrar o treino.",
          errorTitle: "Treinos"
        },
        callback: (session) => {
          store.upsertSession(session);
          void refreshSummary();
        }
      });
    },
    [runAction, store, refreshSummary]
  );

  const handleUndoSession = useCallback(
    async (session: WorkoutSession) => {
      await runAction({
        action: () => removeWorkoutSessionAction(session.id),
        toastMessages: { error: "Não foi possível desfazer o registro.", errorTitle: "Treinos" },
        callback: () => {
          store.dropSession(session.id);
          void refreshSummary();
        }
      });
    },
    [runAction, store, refreshSummary]
  );

  const openSessionModal = useCallback((draft: SessionDraft) => store.setSessionDraft(draft), [store]);
  const closeSessionModal = useCallback(() => store.setSessionDraft(null), [store]);

  const handleSaveSession = useCallback(
    async (payload: RegisterWorkoutSessionPayload) => {
      const previousSession = store.sessionDraft?.session;
      const saved = await runAction({
        action: async () => {
          // Treinos avulsos não têm chave única no servidor: ao editar, removemos o registro antigo.
          if (previousSession && !previousSession.routineId) await removeWorkoutSessionAction(previousSession.id);
          return registerWorkoutSessionAction(payload);
        },
        toastMessages: {
          success: "Treino salvo!",
          error: "Não foi possível salvar o treino.",
          errorTitle: "Treinos",
          preferApiErrorMessage: true
        },
        callback: (session) => {
          if (previousSession && !previousSession.routineId) store.dropSession(previousSession.id);
          store.upsertSession(session);
          store.setSessionDraft(null);
          void refreshSummary();
        }
      });
      return Boolean(saved);
    },
    [runAction, store, refreshSummary]
  );

  const openRoutineForm = useCallback((target: WorkoutRoutine | "new") => store.setRoutineFormTarget(target), [store]);
  const closeRoutineForm = useCallback(() => store.setRoutineFormTarget(null), [store]);

  const handleSaveRoutine = useCallback(
    async (payload: CreateWorkoutRoutinePayload) => {
      const target = store.routineFormTarget;
      const saved = await runAction({
        action: () =>
          target && target !== "new"
            ? updateWorkoutRoutineAction(target.id, payload)
            : createWorkoutRoutineAction(payload),
        toastMessages: {
          success: target && target !== "new" ? "Rotina atualizada!" : "Rotina criada!",
          error: "Não foi possível salvar a rotina.",
          errorTitle: "Treinos",
          preferApiErrorMessage: true
        },
        callback: (routine) => {
          store.upsertRoutine(routine);
          store.setRoutineFormTarget(null);
          void refreshSummary();
        }
      });
      return Boolean(saved);
    },
    [runAction, store, refreshSummary]
  );

  const handleRemoveRoutine = useCallback(
    async (routine: WorkoutRoutine) => {
      await runAction({
        action: () => removeWorkoutRoutineAction(routine.id),
        toastMessages: {
          success: "Rotina removida.",
          error: "Não foi possível remover a rotina.",
          errorTitle: "Treinos"
        },
        callback: () => {
          store.dropRoutine(routine.id);
          void loadWeekSessions(store.weekStart);
          void refreshSummary();
        }
      });
    },
    [runAction, store, loadWeekSessions, refreshSummary]
  );

  const handleToggleRoutineActive = useCallback(
    async (routine: WorkoutRoutine) => {
      await runAction({
        action: () => updateWorkoutRoutineAction(routine.id, { isActive: !routine.isActive }),
        toastMessages: {
          success: routine.isActive ? "Rotina pausada." : "Rotina reativada.",
          successType: "info",
          error: "Não foi possível atualizar a rotina.",
          errorTitle: "Treinos"
        },
        callback: (updated) => {
          store.upsertRoutine(updated);
          void refreshSummary();
        }
      });
    },
    [runAction, store, refreshSummary]
  );

  const handleApplyTemplate = useCallback(
    async (templateId: string) => {
      await runAction({
        action: async () => {
          await applyRoutineTemplateAction(templateId);
          return listWorkoutRoutinesAction();
        },
        toastMessages: {
          success: "Modelo aplicado! Ajuste as cargas quando quiser.",
          error: "Não foi possível aplicar o modelo.",
          errorTitle: "Treinos"
        },
        callback: (routines) => {
          store.setRoutines(routines);
          void refreshSummary();
        }
      });
    },
    [runAction, store, refreshSummary]
  );

  return {
    catalog: store.catalog,
    routines: store.routines,
    sessions: store.sessions,
    summary: store.summary,
    isLoading: store.isLoading,
    todayKey,
    weekStart: store.weekStart,
    weekDates,
    routineFormTarget: store.routineFormTarget,
    sessionDraft: store.sessionDraft,
    findModality,
    loadPage,
    handleChangeWeek,
    handleQuickCheckin,
    handleUndoSession,
    openSessionModal,
    closeSessionModal,
    handleSaveSession,
    openRoutineForm,
    closeRoutineForm,
    handleSaveRoutine,
    handleRemoveRoutine,
    handleToggleRoutineActive,
    handleApplyTemplate
  };
};

export default useWorkoutsPage;
