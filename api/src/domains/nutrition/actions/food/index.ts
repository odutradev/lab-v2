import { foodResponseSchema, listFoodsQuerySchema, listFoodsResponseSchema, createFoodBodySchema, foodParamsSchema, foodIdResponseSchema } from './schemas'
import { getPaginationOptions, buildPaginatedResponse } from '@factories/pagination'
import authMiddlewareWithDocs from '@domains/users/middlewares/auth'
import createAuditLog from '@domains/system/utils/createAuditLog'
import foodRepository from '@domains/nutrition/repositories/food'
import defineAction from '@factories/defineAction'
import { isValidObjectId } from '@database/utils'

import type { ListFoodsQuery, CreateFoodBody, FoodParams } from './types'

export const listFoodsAction = defineAction(
  {
    method: 'get',
    path: '/nutrition/foods/list',
    summary: 'Busca alimentos da base (TACO) e os cadastrados pelo usuário',
    tags: ['Nutrition'],
    authenticate: true,
    schema: { query: listFoodsQuerySchema },
    responses: {
      200: { description: 'Lista de alimentos', schema: listFoodsResponseSchema }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, query, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { search, source, ...pagination } = (query || {}) as ListFoodsQuery
    const { limit, offset, page } = getPaginationOptions({ page: pagination.page, limit: pagination.limit ?? 20 })

    await foodRepository.ensureSeeded()
    const foods = await foodRepository.findAllVisible(ids.userId, { search, source, limit, offset })

    return buildPaginatedResponse(foods, page, limit)
  }
)

export const createFoodAction = defineAction(
  {
    method: 'post',
    path: '/nutrition/foods/create',
    summary: 'Cadastra um alimento próprio (valores por 100 g)',
    tags: ['Nutrition'],
    authenticate: true,
    schema: { body: createFoodBodySchema },
    responses: {
      200: { description: 'Alimento criado', schema: foodResponseSchema }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const payload = data as CreateFoodBody
    const created = await foodRepository.create({ userId: ids.userId, ...payload })

    await createAuditLog({
      actorId: ids.userId,
      action: 'create_food',
      entity: 'Food',
      entityId: String(created.id),
      summary: 'Alimento próprio cadastrado pelo usuário.',
      details: { name: payload.name }
    })

    return created
  }
)

export const removeFoodAction = defineAction(
  {
    method: 'delete',
    path: '/nutrition/foods/:id/remove',
    summary: 'Remove um alimento cadastrado pelo usuário',
    tags: ['Nutrition'],
    authenticate: true,
    schema: { params: foodParamsSchema },
    responses: {
      200: { description: 'Alimento removido', schema: foodIdResponseSchema },
      404: { description: 'Alimento não encontrado' }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, params, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { id } = params as FoodParams
    if (!isValidObjectId(id)) return manageError({ code: 'bad_request' })

    const removed = await foodRepository.deleteCustom(id, ids.userId)
    if (!removed) return manageError({ code: 'not_found' })

    await createAuditLog({
      actorId: ids.userId,
      action: 'remove_food',
      entity: 'Food',
      entityId: id,
      summary: 'Alimento próprio removido pelo usuário.'
    })

    return { id }
  }
)
