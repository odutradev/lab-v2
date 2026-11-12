import type { ActivityLevel, NutritionGoal, BodyMetricsInput, EnergySettings, NutritionTargets, FoodMacrosSource, Macros } from './types'

export const ActivityFactors: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9
}

export const GoalDefaults: Record<NutritionGoal, { adjustmentPercent: number, proteinPerKg: number, fatPerKg: number, weeklyRatePercent: number }> = {
  maintenance: { adjustmentPercent: 0, proteinPerKg: 1.8, fatPerKg: 0.9, weeklyRatePercent: 0 },
  cutting: { adjustmentPercent: -20, proteinPerKg: 2.2, fatPerKg: 0.8, weeklyRatePercent: -0.75 },
  bulking: { adjustmentPercent: 10, proteinPerKg: 1.8, fatPerKg: 0.9, weeklyRatePercent: 0.35 },
  recomposition: { adjustmentPercent: -5, proteinPerKg: 2.2, fatPerKg: 0.8, weeklyRatePercent: 0 }
}

const roundTo = (value: number, decimals: number): number => {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export const findMissingBodyMetrics = (metrics: BodyMetricsInput): string[] => {
  return (['weight', 'height', 'age'] as const).filter((field) => !metrics[field])
}

export const calculateBmr = (sex: EnergySettings['sex'], weight: number, height: number, age: number): number => {
  const sexOffset = sex === 'male' ? 5 : -161
  return Math.round(10 * weight + 6.25 * height - 5 * age + sexOffset)
}

export const calculateNutritionTargets = (settings: EnergySettings, metrics: BodyMetricsInput): NutritionTargets | null => {
  if (!metrics.weight || !metrics.height || !metrics.age) return null

  const bmr = calculateBmr(settings.sex, metrics.weight, metrics.height, metrics.age)
  const tdee = Math.round(bmr * ActivityFactors[settings.activityLevel])
  const calories = settings.customCalories || Math.round(tdee * (1 + settings.adjustmentPercent / 100))
  const protein = Math.round(metrics.weight * settings.proteinPerKg)
  const fat = Math.round(metrics.weight * settings.fatPerKg)
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4))

  return { bmr, tdee, calories, protein, carbs, fat }
}

export const calculateFoodMacros = (food: FoodMacrosSource, grams: number): Macros => {
  const ratio = grams / 100
  return {
    calories: Math.round(food.caloriesPer100g * ratio),
    protein: roundTo(food.proteinPer100g * ratio, 1),
    carbs: roundTo(food.carbsPer100g * ratio, 1),
    fat: roundTo(food.fatPer100g * ratio, 1)
  }
}

export const sumMacros = (items: Macros[]): Macros => {
  const total = items.reduce((sum, item) => ({
    calories: sum.calories + item.calories,
    protein: sum.protein + item.protein,
    carbs: sum.carbs + item.carbs,
    fat: sum.fat + item.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

  return {
    calories: Math.round(total.calories),
    protein: roundTo(total.protein, 1),
    carbs: roundTo(total.carbs, 1),
    fat: roundTo(total.fat, 1)
  }
}

export const normalizeSearchText = (text: string): string => {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}
