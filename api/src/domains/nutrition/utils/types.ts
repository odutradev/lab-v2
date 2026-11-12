export type BiologicalSex = 'male' | 'female'

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive'

export type NutritionGoal = 'maintenance' | 'cutting' | 'bulking' | 'recomposition'

export type ReviewStatus = 'insufficient_data' | 'on_track' | 'increase_calories' | 'decrease_calories'

export interface FoodSeedItem {
  name: string
  category: string
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  fiberPer100g?: number
  servingName?: string
  servingGrams?: number
}

export interface Macros {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface FoodMacrosSource {
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
}

export interface BodyMetricsInput {
  weight?: number
  height?: number
  age?: number
}

export interface EnergySettings {
  sex: BiologicalSex
  activityLevel: ActivityLevel
  adjustmentPercent: number
  proteinPerKg: number
  fatPerKg: number
  customCalories?: number
}

export interface NutritionTargets extends Macros {
  bmr: number
  tdee: number
}
