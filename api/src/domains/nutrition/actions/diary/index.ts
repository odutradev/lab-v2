import { diaryQuerySchema, diaryResponseSchema, createDiaryEntryBodySchema, logPlanMealBodySchema, diaryEntryIdsResponseSchema, diaryEntryParamsSchema, diaryEntryIdResponseSchema, weeklyReviewResponseSchema } from './schemas'
import workoutSessionRepository from '@domains/workouts/repositories/workoutSession'
import foodLogEntryRepository from '@domains/nutrition/repositories/foodLogEntry'
import { calculateFoodMacros, sumMacros } from '@domains/nutrition/utils/energy'
import mealPlanRepository from '@domains/nutrition/repositories/mealPlan'
import { resolveUserNutrition } from '@domains/nutrition/utils/targets'
import authMiddlewareWithDocs from '@domains/users/middlewares/auth'
import { buildWeeklyReview } from '@domains/nutrition/utils/review'
import createAuditLog from '@domains/system/utils/createAuditLog'
import foodRepository from '@domains/nutrition/repositories/food'
import { formatDateKey, addDays } from '@utils/date'
import defineAction from '@factories/defineAction'
import { isValidObjectId } from '@database/utils'

import type { DiaryQuery, CreateDiaryEntryBody, LogPlanMealBody, DiaryEntryParams } from './types'

const ReviewLookbackDays = 13

export const getDiaryAction = defineAction(
  {
    method: 'get',
    path: '/nutrition/diary/details',
    summary: 'Diário alimentar do dia com totais, metas e gasto dos treinos',
    tags: ['Nutrition'],
    authenticate: true,
    schema: { query: diaryQuerySchema },
    responses: {
      200: { description: 'Diário do dia', schema: diaryResponseSchema }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, query, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const date = ((query || {}) as DiaryQuery).date || formatDateKey(new Date())
    const [entries, nutrition, burnedCalories] = await Promise.all([
      foodLogEntryRepository.findByUserInRange(ids.userId, date, date),
      resolveUserNutrition(ids.userId),
      workoutSessionRepository.sumCaloriesByDate(ids.userId, date)
    ])

    const totals = sumMacros(entries)
    const workoutBonus = nutrition.profile?.includeWorkoutCalories ? burnedCalories : 0
    const calorieGoal = nutrition.targets ? nutrition.targets.calories + workoutBonus : null

    return {
      date,
      entries,
      totals,
      targets: nutrition.targets,
      burnedCalories,
      calorieGoal,
      remainingCalories: calorieGoal === null ? null : calorieGoal - totals.calories
    }
  }
)

export const createDiaryEntryAction = defineAction(
  {
    method: 'post',
    path: '/nutrition/diary/entries/create',
    summary: 'Registra um alimento ou calorias rápidas no diário',
    tags: ['Nutrition'],
    authenticate: true,
    schema: { body: createDiaryEntryBodySchema },
    responses: {
      200: { description: 'Registro criado', schema: diaryEntryIdsResponseSchema },
      404: { description: 'Alimento não encontrado' }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const payload = data as CreateDiaryEntryBody
    const date = payload.date || formatDateKey(new Date())
    if (payload.foodId && !isValidObjectId(payload.foodId)) return manageError({ code: 'bad_request' })

    const [food] = payload.foodId && payload.grams ? await foodRepository.findManyVisibleByIds(ids.userId, [payload.foodId]) : []
    if (payload.foodId && payload.grams && !food) return manageError({ code: 'not_found' })

    const entryData = food && payload.grams
      ? { foodId: String(food.id), name: food.name, grams: payload.grams, source: 'food' as const, ...calculateFoodMacros(food, payload.grams) }
      : { name: payload.name || 'Registro rápido', source: 'quick' as const, calories: payload.calories || 0, protein: payload.protein || 0, carbs: payload.carbs || 0, fat: payload.fat || 0 }

    const [created] = await foodLogEntryRepository.createMany([{ userId: ids.userId, date, mealName: payload.mealName, ...entryData }])

    await createAuditLog({
      actorId: ids.userId,
      action: 'create_food_log_entry',
      entity: 'FoodLogEntry',
      entityId: String(created.id),
      summary: 'Registro adicionado ao diário alimentar.',
      details: { date, mealName: payload.mealName, source: entryData.source, calories: created.calories }
    })

    return { ids: [String(created.id)] }
  }
)

export const logPlanMealAction = defineAction(
  {
    method: 'post',
    path: '/nutrition/diary/log-plan-meal',
    summary: 'Registra no diário uma refeição do plano exatamente como planejada',
    tags: ['Nutrition'],
    authenticate: true,
    schema: { body: logPlanMealBodySchema },
    responses: {
      200: { description: 'Refeição registrada', schema: diaryEntryIdsResponseSchema },
      404: { description: 'Plano ou refeição não encontrados' }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const payload = data as LogPlanMealBody
    if (!isValidObjectId(payload.mealPlanId)) return manageError({ code: 'bad_request' })

    const plan = await mealPlanRepository.findByIdAndUser(payload.mealPlanId, ids.userId)
    const meal = plan?.meals.find((item) => item.id === payload.mealId)
    if (!meal) return manageError({ code: 'not_found' })

    const userId = ids.userId
    const date = payload.date || formatDateKey(new Date())

    await foodLogEntryRepository.deleteByPlanMeal(userId, date, meal.id)
    const created = await foodLogEntryRepository.createMany(meal.items.map((item) => ({
      userId,
      date,
      mealName: meal.name,
      planMealId: meal.id,
      foodId: item.foodId,
      name: item.foodName,
      grams: item.grams,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      source: 'plan' as const
    })))

    const createdIds = created.map((entry) => String(entry.id))

    await createAuditLog({
      actorId: userId,
      action: 'log_plan_meal',
      entity: 'FoodLogEntry',
      entityId: createdIds[0] || meal.id,
      summary: 'Refeição do plano registrada no diário.',
      details: { date, mealPlanId: payload.mealPlanId, mealId: meal.id, items: createdIds.length }
    })

    return { ids: createdIds }
  }
)

export const removeDiaryEntryAction = defineAction(
  {
    method: 'delete',
    path: '/nutrition/diary/entries/:id/remove',
    summary: 'Remove um registro do diário alimentar',
    tags: ['Nutrition'],
    authenticate: true,
    schema: { params: diaryEntryParamsSchema },
    responses: {
      200: { description: 'Registro removido', schema: diaryEntryIdResponseSchema },
      404: { description: 'Registro não encontrado' }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, params, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { id } = params as DiaryEntryParams
    if (!isValidObjectId(id)) return manageError({ code: 'bad_request' })

    const removed = await foodLogEntryRepository.delete(id, ids.userId)
    if (!removed) return manageError({ code: 'not_found' })

    await createAuditLog({
      actorId: ids.userId,
      action: 'remove_food_log_entry',
      entity: 'FoodLogEntry',
      entityId: id,
      summary: 'Registro removido do diário alimentar.'
    })

    return { id }
  }
)

export const getWeeklyReviewAction = defineAction(
  {
    method: 'get',
    path: '/nutrition/review/details',
    summary: 'Revisão semanal: tendência de peso, aderência e sugestão de ajuste',
    tags: ['Nutrition'],
    authenticate: true,
    responses: {
      200: { description: 'Revisão semanal', schema: weeklyReviewResponseSchema },
      404: { description: 'Perfil nutricional não configurado' }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const today = new Date()
    const todayKey = formatDateKey(today)
    const [nutrition, entries] = await Promise.all([
      resolveUserNutrition(ids.userId),
      foodLogEntryRepository.findByUserInRange(ids.userId, formatDateKey(addDays(today, -ReviewLookbackDays)), todayKey)
    ])

    if (!nutrition.profile) return manageError({ code: 'not_found' })

    return buildWeeklyReview({
      goal: nutrition.profile.goal,
      targets: nutrition.targets,
      weightHistory: nutrition.weightHistory,
      entries,
      todayKey
    })
  }
)
