import { FoodModel } from '@domains/nutrition/repositories/food/model'
import { normalizeSearchText } from '@domains/nutrition/utils/energy'
import { FoodSeed } from '@domains/nutrition/utils/foodSeed'
import { toObjectId } from '@database/utils'

import type { FoodModelType, CreateFoodPayload, ListFoodsFilters } from '@domains/nutrition/repositories/food/types'
import type { PaginatedData } from '@factories/pagination/types'

const seedState = { isSeeded: false }

const toFood = (document: object & { _id: { toString: () => string }, userId?: { toString: () => string } }): FoodModelType => {
  return { ...document, id: document._id.toString(), userId: document.userId?.toString() } as unknown as FoodModelType
}

const escapeRegex = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const buildVisibilityQuery = (userId: string) => ({
  $or: [{ source: 'taco' }, { userId: toObjectId(userId) }]
})

const foodRepository = {
  ensureSeeded: async (): Promise<void> => {
    if (seedState.isSeeded) return
    const seededCount = await FoodModel.countDocuments({ source: 'taco' })
    if (seededCount === 0) {
      await FoodModel.insertMany(FoodSeed.map((food) => ({ ...food, source: 'taco', normalizedName: normalizeSearchText(food.name) })))
    }
    seedState.isSeeded = true
  },

  findAllVisible: async (userId: string, filters: ListFoodsFilters): Promise<PaginatedData<FoodModelType>> => {
    const searchQuery = filters.search ? { normalizedName: { $regex: escapeRegex(normalizeSearchText(filters.search)) } } : {}
    const sourceQuery = filters.source ? { source: filters.source } : {}
    const query = { ...buildVisibilityQuery(userId), ...searchQuery, ...sourceQuery }

    const [rows, count] = await Promise.all([
      FoodModel.find(query).sort({ source: 1, normalizedName: 1 }).skip(filters.offset).limit(filters.limit).lean(),
      FoodModel.countDocuments(query)
    ])

    return { rows: rows.map(toFood), count }
  },

  findManyVisibleByIds: async (userId: string, ids: string[]): Promise<FoodModelType[]> => {
    const foods = await FoodModel.find({ _id: { $in: ids.map(toObjectId) }, ...buildVisibilityQuery(userId) }).lean()
    return foods.map(toFood)
  },

  create: async (payload: CreateFoodPayload): Promise<FoodModelType> => {
    const created = await FoodModel.create({
      ...payload,
      userId: toObjectId(payload.userId),
      name: payload.name.trim(),
      normalizedName: normalizeSearchText(payload.name),
      category: payload.category?.trim() || 'Meus alimentos',
      source: 'custom'
    })
    return toFood(created.toObject())
  },

  deleteCustom: async (id: string, userId: string): Promise<boolean> => {
    const result = await FoodModel.deleteOne({ _id: toObjectId(id), userId: toObjectId(userId), source: 'custom' })
    return result.deletedCount > 0
  }
}

export default foodRepository
