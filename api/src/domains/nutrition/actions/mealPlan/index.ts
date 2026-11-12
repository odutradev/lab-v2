import { mealPlanResponseSchema, listMealPlansQuerySchema, listMealPlansResponseSchema, createMealPlanBodySchema, updateMealPlanBodySchema, mealPlanParamsSchema, mealPlanIdResponseSchema } from './schemas'
import { buildMeals, collectFoodIds, withMealPlanTotals } from '@domains/nutrition/utils/mealPlan'
import mealPlanRepository from '@domains/nutrition/repositories/mealPlan'
import authMiddlewareWithDocs from '@domains/users/middlewares/auth'
import createAuditLog from '@domains/system/utils/createAuditLog'
import foodRepository from '@domains/nutrition/repositories/food'
import { paginateList } from '@factories/pagination'
import defineAction from '@factories/defineAction'
import { isValidObjectId } from '@database/utils'

import type { ListMealPlansQuery, CreateMealPlanBody, UpdateMealPlanBody, MealPlanParams, MealPlanMealInput } from './types'

const resolveMeals = async (userId: string, meals: MealPlanMealInput[]) => {
  const foodIds = collectFoodIds(meals)
  if (foodIds.some((foodId) => !isValidObjectId(foodId))) return null
  const foods = await foodRepository.findManyVisibleByIds(userId, foodIds)
  return buildMeals(meals, foods)
}

export const createMealPlanAction = defineAction(
  {
    method: 'post',
    path: '/nutrition/meal-plans/create',
    summary: 'Cria um plano alimentar com refeições e alimentos',
    tags: ['Nutrition'],
    authenticate: true,
    schema: { body: createMealPlanBodySchema },
    responses: {
      200: { description: 'Plano criado', schema: mealPlanResponseSchema },
      400: { description: 'Alimento inválido no plano' }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const payload = data as CreateMealPlanBody
    const [meals, existingCount] = await Promise.all([
      resolveMeals(ids.userId, payload.meals),
      mealPlanRepository.countByUser(ids.userId)
    ])
    if (!meals) return manageError({ code: 'bad_request' })

    const created = await mealPlanRepository.create({
      userId: ids.userId,
      name: payload.name,
      isActive: payload.isActive ?? existingCount === 0,
      meals
    })

    await createAuditLog({
      actorId: ids.userId,
      action: 'create_meal_plan',
      entity: 'MealPlan',
      entityId: String(created.id),
      summary: 'Plano alimentar criado pelo usuário.',
      details: { name: payload.name, meals: meals.length }
    })

    return withMealPlanTotals(created)
  }
)

export const listMealPlansAction = defineAction(
  {
    method: 'get',
    path: '/nutrition/meal-plans/list',
    summary: 'Lista os planos alimentares do usuário',
    tags: ['Nutrition'],
    authenticate: true,
    schema: { query: listMealPlansQuerySchema },
    responses: {
      200: { description: 'Planos alimentares', schema: listMealPlansResponseSchema }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, query, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { page, limit } = (query || {}) as ListMealPlansQuery
    const plans = await mealPlanRepository.findAllByUser(ids.userId)

    return paginateList(plans.map(withMealPlanTotals), { page, limit })
  }
)

export const updateMealPlanAction = defineAction(
  {
    method: 'patch',
    path: '/nutrition/meal-plans/:id/update',
    summary: 'Atualiza um plano alimentar ou o define como ativo',
    tags: ['Nutrition'],
    authenticate: true,
    schema: { params: mealPlanParamsSchema, body: updateMealPlanBodySchema },
    responses: {
      200: { description: 'Plano atualizado', schema: mealPlanResponseSchema },
      404: { description: 'Plano não encontrado' }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, params, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { id } = params as MealPlanParams
    if (!isValidObjectId(id)) return manageError({ code: 'bad_request' })

    const payload = data as UpdateMealPlanBody
    const meals = payload.meals ? await resolveMeals(ids.userId, payload.meals) : undefined
    if (meals === null) return manageError({ code: 'bad_request' })

    const updated = await mealPlanRepository.update(id, ids.userId, { name: payload.name, isActive: payload.isActive, ...(meals && { meals }) })
    if (!updated) return manageError({ code: 'not_found' })

    await createAuditLog({
      actorId: ids.userId,
      action: 'update_meal_plan',
      entity: 'MealPlan',
      entityId: id,
      summary: 'Plano alimentar atualizado pelo usuário.',
      details: { name: payload.name, isActive: payload.isActive, meals: meals?.length }
    })

    return withMealPlanTotals(updated)
  }
)

export const removeMealPlanAction = defineAction(
  {
    method: 'delete',
    path: '/nutrition/meal-plans/:id/remove',
    summary: 'Remove um plano alimentar',
    tags: ['Nutrition'],
    authenticate: true,
    schema: { params: mealPlanParamsSchema },
    responses: {
      200: { description: 'Plano removido', schema: mealPlanIdResponseSchema },
      404: { description: 'Plano não encontrado' }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, params, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { id } = params as MealPlanParams
    if (!isValidObjectId(id)) return manageError({ code: 'bad_request' })

    const removed = await mealPlanRepository.delete(id, ids.userId)
    if (!removed) return manageError({ code: 'not_found' })

    await createAuditLog({
      actorId: ids.userId,
      action: 'remove_meal_plan',
      entity: 'MealPlan',
      entityId: id,
      summary: 'Plano alimentar removido pelo usuário.'
    })

    return { id }
  }
)
