import { NutritionProfileModel } from '@domains/nutrition/repositories/nutritionProfile/model'
import { toObjectId } from '@database/utils'

import type { NutritionProfileModelType, SaveNutritionProfilePayload } from '@domains/nutrition/repositories/nutritionProfile/types'

const toProfile = (document: object & { _id: { toString: () => string }, userId: { toString: () => string } }): NutritionProfileModelType => {
  return { ...document, id: document._id.toString(), userId: document.userId.toString() } as unknown as NutritionProfileModelType
}

const nutritionProfileRepository = {
  findByUser: async (userId: string): Promise<NutritionProfileModelType | null> => {
    const profile = await NutritionProfileModel.findOne({ userId: toObjectId(userId) }).lean()
    if (!profile) return null
    return toProfile(profile)
  },

  save: async (userId: string, payload: SaveNutritionProfilePayload): Promise<NutritionProfileModelType> => {
    const unsetFields = Object.fromEntries(
      (['customCalories', 'targetWeight', 'phaseEndDate'] as const).filter((field) => payload[field] === undefined).map((field) => [field, 1])
    )

    const definedFields = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined))

    const saved = await NutritionProfileModel.findOneAndUpdate(
      { userId: toObjectId(userId) },
      { $set: definedFields,...(Object.keys(unsetFields).length > 0 && { $unset: unsetFields }) },
      { new: true, upsert: true }
    ).lean()

    return toProfile(saved)
  }
}

export default nutritionProfileRepository
