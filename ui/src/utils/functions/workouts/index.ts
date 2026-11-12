import { addDaysToDateString, getTodayDateString } from "@utils/functions/challenges";

import type { MuscleGroup, WorkoutRoutine, WorkoutSession } from "@actions/workouts/types";

export const weekDayShortLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const weekDayLongLabels = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export const muscleGroupLabels: Record<MuscleGroup, string> = {
  chest: "Peito",
  back: "Costas",
  shoulders: "Ombros",
  biceps: "Bíceps",
  triceps: "Tríceps",
  legs: "Pernas",
  glutes: "Glúteos",
  calves: "Panturrilhas",
  core: "Abdômen"
};

export const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const getWeekDay = (dateKey: string): number => parseDateKey(dateKey).getDay();

// A semana começa na segunda-feira, como na maioria das rotinas de treino.
export const getWeekStart = (dateKey: string = getTodayDateString()): string => {
  const weekDay = getWeekDay(dateKey);
  const offset = weekDay === 0 ? -6 : 1 - weekDay;
  return addDaysToDateString(dateKey, offset);
};

export const getWeekDates = (weekStart: string): string[] => {
  return Array.from({ length: 7 }, (_, index) => addDaysToDateString(weekStart, index));
};

export const getMonthRange = (dateKey: string = getTodayDateString()): { startDate: string; endDate: string } => {
  const date = parseDateKey(dateKey);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return { startDate: `${date.getFullYear()}-${month}-01`, endDate: `${date.getFullYear()}-${month}-${lastDay}` };
};

export const formatShortDate = (dateKey: string): string => {
  const [, month, day] = dateKey.split("-");
  return `${day}/${month}`;
};

export const getPlannedRoutines = (routines: WorkoutRoutine[], dateKey: string): WorkoutRoutine[] => {
  const weekDay = getWeekDay(dateKey);
  return routines.filter((routine) => routine.isActive && routine.weekDays.includes(weekDay));
};

export const findRoutineSession = (
  sessions: WorkoutSession[],
  routineId: string,
  dateKey: string
): WorkoutSession | undefined => {
  return sessions.find((session) => session.routineId === routineId && session.date === dateKey);
};

export const getExtraSessions = (sessions: WorkoutSession[], dateKey: string): WorkoutSession[] => {
  return sessions.filter((session) => !session.routineId && session.date === dateKey);
};

export const formatWeekDays = (weekDays: number[]): string => {
  if (weekDays.length === 0) return "Sem dias fixos";
  if (weekDays.length === 7) return "Todos os dias";
  return weekDays.map((day) => weekDayShortLabels[day]).join(", ");
};

// Inputs numéricos do Mantine devolvem string vazia quando o campo é limpo.
export const toOptionalNumber = (value: string | number): number | undefined =>
  typeof value === "number" ? value : undefined;
