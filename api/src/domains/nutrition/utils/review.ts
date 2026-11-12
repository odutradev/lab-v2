import { formatDateKey, parseDateKey, addDays } from '@utils/date'
import { GoalDefaults } from './energy'

import type { FoodLogEntryModelType } from '@domains/nutrition/repositories/foodLogEntry/types'
import type { UserWeightRecord } from '@domains/users/repositories/user/types'
import type { NutritionGoal, NutritionTargets, ReviewStatus } from './types'

const RateTolerancePercent = 0.25
const AdherenceTolerance = 0.1
const KcalPerKg = 7700
const MinimumLoggedDays = 4

interface WeeklyReviewInput {
  goal: NutritionGoal
  targets: NutritionTargets | null
  weightHistory: UserWeightRecord[]
  entries: FoodLogEntryModelType[]
  todayKey: string
}

const averageOf = (values: number[]): number | null => {
  if (values.length === 0) return null
  return Math.round((values.reduce((total, value) => total + value, 0) / values.length) * 10) / 10
}

const averageWeightBetween = (weightHistory: UserWeightRecord[], startDate: string, endDate: string): number | null => {
  return averageOf(weightHistory.filter((record) => record.date.slice(0, 10) >= startDate && record.date.slice(0, 10) <= endDate).map((record) => record.weight))
}

const roundToNearestFifty = (value: number): number => Math.round(value / 50) * 50

const resolveStatus = (weeklyChangePercent: number | null, targetRatePercent: number, loggedDays: number): ReviewStatus => {
  if (weeklyChangePercent === null || loggedDays < MinimumLoggedDays) return 'insufficient_data'
  if (weeklyChangePercent > targetRatePercent + RateTolerancePercent) return 'decrease_calories'
  if (weeklyChangePercent < targetRatePercent - RateTolerancePercent) return 'increase_calories'
  return 'on_track'
}

export const buildWeeklyReview = ({ goal, targets, weightHistory, entries, todayKey }: WeeklyReviewInput) => {
  const today = parseDateKey(todayKey)
  const currentWeekStart = formatDateKey(addDays(today, -6))
  const previousWeekStart = formatDateKey(addDays(today, -13))
  const previousWeekEnd = formatDateKey(addDays(today, -7))

  const currentWeekAverageWeight = averageWeightBetween(weightHistory, currentWeekStart, todayKey)
  const previousWeekAverageWeight = averageWeightBetween(weightHistory, previousWeekStart, previousWeekEnd)
  const weeklyChangePercent = currentWeekAverageWeight && previousWeekAverageWeight
    ? Math.round(((currentWeekAverageWeight - previousWeekAverageWeight) / previousWeekAverageWeight) * 1000) / 10
    : null

  const caloriesByDay = entries
    .filter((entry) => entry.date >= currentWeekStart && entry.date <= todayKey)
    .reduce<Record<string, number>>((totals, entry) => ({ ...totals, [entry.date]: (totals[entry.date] || 0) + entry.calories }), {})

  const dailyCalories = Object.values(caloriesByDay)
  const averageCalories = averageOf(dailyCalories)
  const adherentDays = targets
    ? dailyCalories.filter((calories) => Math.abs(calories - targets.calories) <= targets.calories * AdherenceTolerance).length
    : 0

  const targetRatePercent = GoalDefaults[goal].weeklyRatePercent
  const status = resolveStatus(weeklyChangePercent, targetRatePercent, dailyCalories.length)
  const referenceWeight = currentWeekAverageWeight || 0
  const rateGapPercent = weeklyChangePercent === null ? 0 : targetRatePercent - weeklyChangePercent
  const rawAdjustment = (rateGapPercent / 100) * referenceWeight * KcalPerKg / 7
  const suggestedCalorieAdjustment = status === 'increase_calories' || status === 'decrease_calories'
    ? Math.sign(rawAdjustment) * Math.min(300, Math.max(100, roundToNearestFifty(Math.abs(rawAdjustment))))
    : 0

  return {
    goal,
    targetRatePercent,
    currentWeekAverageWeight,
    previousWeekAverageWeight,
    weeklyChangePercent,
    loggedDays: dailyCalories.length,
    averageCalories: averageCalories === null ? null : Math.round(averageCalories),
    adherentDays,
    targetCalories: targets?.calories ?? null,
    status,
    suggestedCalorieAdjustment
  }
}
