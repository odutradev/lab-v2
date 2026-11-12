import { MealPlanModel } from '@domains/nutrition/repositories/mealPlan/model'
import { toObjectId } from '@database/utils'

import type { MealPlanModelType, CreateMealPlanPayload, UpdateMealPlanPayload } from '@domains/nutrition/repositories/mealPlan/types'

const toMealPlan = (document: object & { _id: { toString: () => string }, userId: { toString: () => string } }): MealPlanModelType => {
  return { ...document, id: document._id.toString(), userId: document.userId.toString() } as unknown as MealPlanModelType
}

const deactivateOthers = async (userId: string, activeId: string): Promise<void> => {
  await MealPlanModel.updateMany({ userId: toObjectId(userId), _id: { $ne: toObjectId(activeId) } }, { isActive: false })
}

const mealPlanRepository = {
  create: async (payload: CreateMealPlanPayload): Promise<MealPlanModelType> => {
    const created = await MealPlanModel.create({ ...payload, userId: toObjectId(payload.userId), name: payload.name.trim() })
    if (payload.isActive) await deactivateOthers(payload.userId, created._id.toString())
    return toMealPlan(created.toObject())
  },

  countByUser: async (userId: string): Promise<number> => {
    return MealPlanModel.countDocuments({ userId: toObjectId(userId) })
  },

  findAllByUser: async (userId: string): Promise<MealPlanModelType[]> => {
    const plans = await MealPlanModel.find({ userId: toObjectId(userId) }).sort({ isActive: -1, createdAt: 1 }).lean()
    return plans.map(toMealPlan)
  },

  findByIdAndUser: async (id: string, userId: string): Promise<MealPlanModelType | null> => {
    const plan = await MealPlanModel.findOne({ _id: toObjectId(id), userId: toObjectId(userId) }).lean()
    if (!plan) return null
    return toMealPlan(plan)
  },

  update: async (id: string, userId: string, payload: UpdateMealPlanPayload): Promise<MealPlanModelType | null> => {
    const updateData = { ...payload, ...(payload.name !== undefined && { name: payload.name.trim() }) }
    const updated = await MealPlanModel.findOneAndUpdate({ _id: toObjectId(id), userId: toObjectId(userId) }, updateData, { new: true }).lean()
    if (!updated) return null
    if (payload.isActive) await deactivateOthers(userId, id)
    return toMealPlan(updated)
  },

  delete: async (id: string, userId: string): Promise<boolean> => {
    const result = await MealPlanModel.deleteOne({ _id: toObjectId(id), userId: toObjectId(userId) })
    return result.deletedCount > 0
  }
}

export default mealPlanRepository
