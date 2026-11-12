import { randomUUID } from 'crypto'

import { calculateFoodMacros, sumMacros } from './energy'

import type { MealPlanModelType, MealPlanMeal } from '@domains/nutrition/repositories/mealPlan/types'
import type { FoodModelType } from '@domains/nutrition/repositories/food/types'

interface MealInput {
  id?: string
  name: string
  time?: string
  items: Array<{ foodId: string, grams: number }>
}

export const collectFoodIds = (meals: MealInput[]): string[] => {
  return [...new Set(meals.flatMap((meal) => meal.items.map((item) => item.foodId)))]
}

export const buildMeals = (meals: MealInput[], foods: FoodModelType[]): MealPlanMeal[] | null => {
  const foodsById = new Map(foods.map((food) => [String(food.id), food]))
  const hasUnknownFood = meals.some((meal) => meal.items.some((item) => !foodsById.has(item.foodId)))
  if (hasUnknownFood) return null

  return meals.map((meal) => ({
    id: meal.id || randomUUID(),
    name: meal.name.trim(),
    time: meal.time,
    items: meal.items.map((item) => {
      const food = foodsById.get(item.foodId) as FoodModelType
      return { id: randomUUID(), foodId: item.foodId, foodName: food.name, grams: item.grams, ...calculateFoodMacros(food, item.grams) }
    })
  }))
}

export const withMealPlanTotals = (plan: MealPlanModelType) => {
  const meals = plan.meals.map((meal) => ({ ...meal, totals: sumMacros(meal.items) }))
  return { ...plan, meals, totals: sumMacros(meals.map((meal) => meal.totals)) }
}
