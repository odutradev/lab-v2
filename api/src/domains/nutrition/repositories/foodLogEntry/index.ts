import { FoodLogEntryModel } from '@domains/nutrition/repositories/foodLogEntry/model'
import { toObjectId } from '@database/utils'

import type { FoodLogEntryModelType, CreateFoodLogEntryPayload } from '@domains/nutrition/repositories/foodLogEntry/types'

const toEntry = (document: object & { _id: { toString: () => string }, userId: { toString: () => string } }): FoodLogEntryModelType => {
  return { ...document, id: document._id.toString(), userId: document.userId.toString() } as unknown as FoodLogEntryModelType
}

const foodLogEntryRepository = {
  createMany: async (payloads: CreateFoodLogEntryPayload[]): Promise<FoodLogEntryModelType[]> => {
    const created = await FoodLogEntryModel.insertMany(payloads.map((payload) => ({ ...payload, userId: toObjectId(payload.userId) })))
    return created.map((document) => toEntry(document.toObject()))
  },

  findByUserInRange: async (userId: string, startDate: string, endDate: string): Promise<FoodLogEntryModelType[]> => {
    const entries = await FoodLogEntryModel.find({ userId: toObjectId(userId), date: { $gte: startDate, $lte: endDate } })
      .sort({ date: 1, createdAt: 1 })
      .lean()
    return entries.map(toEntry)
  },

  deleteByPlanMeal: async (userId: string, date: string, planMealId: string): Promise<number> => {
    const result = await FoodLogEntryModel.deleteMany({ userId: toObjectId(userId), date, planMealId })
    return result.deletedCount
  },

  delete: async (id: string, userId: string): Promise<boolean> => {
    const result = await FoodLogEntryModel.deleteOne({ _id: toObjectId(id), userId: toObjectId(userId) })
    return result.deletedCount > 0
  }
}

export default foodLogEntryRepository
