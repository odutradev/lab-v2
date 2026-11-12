import { create } from "zustand";

import { getWeekStart } from "@utils/functions/workouts";

import type { WorkoutsState } from "@stores/workouts/types";

export const useWorkoutsStore = create<WorkoutsState>((set) => ({
  catalog: null,
  routines: [],
  sessions: [],
  summary: null,
  weekStart: getWeekStart(),
  isLoading: true,
  routineFormTarget: null,
  sessionDraft: null,

  setCatalog: (catalog) => set({ catalog }),
  setRoutines: (routines) => set({ routines }),
  setSessions: (sessions) => set({ sessions }),
  setSummary: (summary) => set({ summary }),
  setWeekStart: (weekStart) => set({ weekStart }),
  setIsLoading: (isLoading) => set({ isLoading }),

  upsertRoutine: (routine) =>
    set((state) => ({
      routines: state.routines.some((item) => item.id === routine.id)
        ? state.routines.map((item) => (item.id === routine.id ? routine : item))
        : [...state.routines, routine]
    })),

  dropRoutine: (id) => set((state) => ({ routines: state.routines.filter((item) => item.id !== id) })),

  upsertSession: (session) =>
    set((state) => ({
      sessions: state.sessions.some((item) => item.id === session.id)
        ? state.sessions.map((item) => (item.id === session.id ? session : item))
        : [session, ...state.sessions]
    })),

  dropSession: (id) => set((state) => ({ sessions: state.sessions.filter((item) => item.id !== id) })),

  setRoutineFormTarget: (routineFormTarget) => set({ routineFormTarget }),
  setSessionDraft: (sessionDraft) => set({ sessionDraft })
}));

export default useWorkoutsStore;
