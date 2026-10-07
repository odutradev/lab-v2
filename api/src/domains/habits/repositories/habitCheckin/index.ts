import { HabitCheckinModel } from '@domains/habits/repositories/habitCheckin/model'
import { toObjectId } from '@database/utils'

import type { HabitCheckinModelType, UpsertCheckinPayload } from '@domains/habits/repositories/habitCheckin/types'

const habitCheckinRepository = {
  upsertCheckin: async ({ userId, habitId, date, completed }: UpsertCheckinPayload): Promise<HabitCheckinModelType> => {
    const checkin = await HabitCheckinModel.findOneAndUpdate(
      {
        userId: toObjectId(userId),
        habitId: toObjectId(habitId),
        date
      },
      {
        userId: toObjectId(userId),
        habitId: toObjectId(habitId),
        date,
        completed
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    ).lean()

    return { ...checkin, id: checkin._id.toString() } as unknown as HabitCheckinModelType
  },
  findByUserAndDate: async (userId: string, date: string): Promise<HabitCheckinModelType[]> => {
    const checkins = await HabitCheckinModel.find({
      userId: toObjectId(userId),
      date
    }).lean()

    return checkins.map((item) => ({ ...item, id: item._id.toString() })) as unknown as HabitCheckinModelType[]
  },
  findByUserAndDateRange: async (userId: string, startDate: string, endDate: string): Promise<HabitCheckinModelType[]> => {
    const checkins = await HabitCheckinModel.find({
      userId: toObjectId(userId),
      date: { $gte: startDate, $lte: endDate }
    }).lean()

    return checkins.map((item) => ({ ...item, id: item._id.toString() })) as unknown as HabitCheckinModelType[]
  },
  findByUserHabitAndDate: async (userId: string, habitId: string, date: string): Promise<HabitCheckinModelType | null> => {
    const checkin = await HabitCheckinModel.findOne({
      userId: toObjectId(userId),
      habitId: toObjectId(habitId),
      date
    }).lean()

    if (!checkin) return null
    return { ...checkin, id: checkin._id.toString() } as unknown as HabitCheckinModelType
  },
  deleteByHabitId: async (habitId: string): Promise<number> => {
    const result = await HabitCheckinModel.deleteMany({ habitId: toObjectId(habitId) })
    return result.deletedCount
  },
  deleteByUserHabitAndDate: async (userId: string, habitId: string, date: string): Promise<boolean> => {
    const result = await HabitCheckinModel.deleteOne({
      userId: toObjectId(userId),
      habitId: toObjectId(habitId),
      date
    })
    return result.deletedCount > 0
  },
  deleteByUserHabitAndDateFrom: async (userId: string, habitId: string, fromDate: string): Promise<number> => {
    const result = await HabitCheckinModel.deleteMany({
      userId: toObjectId(userId),
      habitId: toObjectId(habitId),
      date: { $gte: fromDate }
    })
    return result.deletedCount
  }
}

export default habitCheckinRepository
