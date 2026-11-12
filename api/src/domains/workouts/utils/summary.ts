import { formatDateKey, parseDateKey, addDays, countDaysBetween } from '@utils/date'

import type { WorkoutSessionModelType } from '@domains/workouts/repositories/workoutSession/types'
import type { WorkoutRoutineModelType } from '@domains/workouts/repositories/workoutRoutine/types'

const StreakLookbackDays = 180

const listDateKeys = (startDate: string, endDate: string): string[] => {
  const start = parseDateKey(startDate)
  const totalDays = countDaysBetween(start, parseDateKey(endDate)) + 1
  return Array.from({ length: Math.max(0, totalDays) }, (_, index) => formatDateKey(addDays(start, index)))
}

const getPlannedRoutines = (routines: WorkoutRoutineModelType[], dateKey: string): WorkoutRoutineModelType[] => {
  const weekDay = parseDateKey(dateKey).getDay()
  return routines.filter((routine) => routine.isActive && routine.weekDays.includes(weekDay) && formatDateKey(new Date(routine.createdAt)) <= dateKey)
}

const isRoutineDone = (sessions: WorkoutSessionModelType[], routineId: string, dateKey: string): boolean => {
  return sessions.some((session) => session.status === 'done' && session.date === dateKey && String(session.routineId) === routineId)
}

const isDayCompleted = (routines: WorkoutRoutineModelType[], sessions: WorkoutSessionModelType[], dateKey: string): boolean | undefined => {
  const planned = getPlannedRoutines(routines, dateKey)
  const hasExtraSession = sessions.some((session) => session.status === 'done' && session.date === dateKey && !session.routineId)
  if (planned.length === 0) return hasExtraSession ? true : undefined
  return planned.every((routine) => isRoutineDone(sessions, String(routine.id), dateKey))
}

export const calculateCurrentStreak = (routines: WorkoutRoutineModelType[], sessions: WorkoutSessionModelType[], todayKey: string): number => {
  const today = parseDateKey(todayKey)
  const dateKeys = Array.from({ length: StreakLookbackDays }, (_, index) => formatDateKey(addDays(today, -index)))

  return dateKeys.reduce((state, dateKey) => {
    if (state.isBroken) return state
    const completed = isDayCompleted(routines, sessions, dateKey)
    if (completed === undefined) return state
    if (completed) return { ...state, streak: state.streak + 1 }
    if (dateKey === todayKey) return state
    return { ...state, isBroken: true }
  }, { streak: 0, isBroken: false }).streak
}

export const calculateWorkoutSummary = (routines: WorkoutRoutineModelType[], sessions: WorkoutSessionModelType[], startDate: string, endDate: string, todayKey: string) => {
  const lastCountedDate = endDate < todayKey ? endDate : todayKey
  const dateKeys = startDate <= lastCountedDate ? listDateKeys(startDate, lastCountedDate) : []
  const sessionsInRange = sessions.filter((session) => session.date >= startDate && session.date <= endDate)
  const doneSessions = sessionsInRange.filter((session) => session.status === 'done')

  const plannedPairs = dateKeys.flatMap((dateKey) => getPlannedRoutines(routines, dateKey).map((routine) => ({ dateKey, routineId: String(routine.id) })))
  const donePlannedCount = plannedPairs.filter((pair) => isRoutineDone(sessions, pair.routineId, pair.dateKey)).length

  const modalityTotals = doneSessions.reduce<Record<string, { count: number, minutes: number }>>((totals, session) => ({
    ...totals,
    [session.modalityId]: {
      count: (totals[session.modalityId]?.count || 0) + 1,
      minutes: (totals[session.modalityId]?.minutes || 0) + (session.durationMinutes || 0)
    }
  }), {})

  return {
    plannedCount: plannedPairs.length,
    donePlannedCount,
    doneCount: doneSessions.length,
    missedCount: sessionsInRange.filter((session) => session.status === 'missed').length,
    adherenceRate: plannedPairs.length > 0 ? Math.round((donePlannedCount / plannedPairs.length) * 100) : 0,
    totalMinutes: doneSessions.reduce((total, session) => total + (session.durationMinutes || 0), 0),
    totalCalories: doneSessions.reduce((total, session) => total + (session.caloriesBurned || 0), 0),
    totalDistanceKm: Math.round(doneSessions.reduce((total, session) => total + (session.distanceKm || 0), 0) * 10) / 10,
    currentStreak: calculateCurrentStreak(routines, sessions, todayKey),
    modalities: Object.entries(modalityTotals).map(([modalityId, totals]) => ({ modalityId, ...totals }))
  }
}
