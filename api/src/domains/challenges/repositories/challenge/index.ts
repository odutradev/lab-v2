import { ChallengeModel } from '@domains/challenges/repositories/challenge/model'
import { toObjectId } from '@database/utils'

import type {
  ChallengeModelType,
  CreateChallengePayload,
  UpdateChallengePayload,
  ListChallengesFilters
} from '@domains/challenges/repositories/challenge/types'

const getTodayDateString = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const challengeRepository = {
  create: async (payload: CreateChallengePayload): Promise<ChallengeModelType> => {
    const startDate = payload.startDate || getTodayDateString()

    const created = await ChallengeModel.create({
      userId: toObjectId(payload.userId),
      title: payload.title.trim(),
      description: payload.description?.trim() || undefined,
      motivation: payload.motivation?.trim() || undefined,
      emoji: payload.emoji?.trim() || '🎯',
      targetDays: payload.targetDays,
      startDate,
      checkins: [],
      status: 'active',
      type: payload.type || 'streak',
      resetOnMiss: Boolean(payload.resetOnMiss),
      slipDates: [],
      freezeDaysPerMonth: typeof payload.freezeDaysPerMonth === 'number'
        ? Math.min(7, Math.max(0, payload.freezeDaysPerMonth))
        : 2,
      freezeDates: []
    })

    return { ...created.toObject(), id: created._id.toString() } as unknown as ChallengeModelType
  },

  findByIdAndUser: async (id: string, userId: string): Promise<ChallengeModelType | null> => {
    const item = await ChallengeModel.findOne({
      _id: toObjectId(id),
      userId: toObjectId(userId)
    }).lean()

    if (!item) return null
    return { ...item, id: item._id.toString() } as unknown as ChallengeModelType
  },

  findAllByUser: async (userId: string, filters?: ListChallengesFilters): Promise<ChallengeModelType[]> => {
    const query: Record<string, unknown> = { userId: toObjectId(userId) }
    if (filters?.status) {
      query.status = filters.status
    }

    const items = await ChallengeModel.find(query)
      .sort({ status: 1, createdAt: -1 })
      .lean()

    return items.map((doc) => ({
      ...doc,
      id: doc._id.toString()
    })) as unknown as ChallengeModelType[]
  },

  update: async (
    id: string,
    userId: string,
    payload: UpdateChallengePayload
  ): Promise<ChallengeModelType | null> => {
    const updateData: Record<string, unknown> = {}

    if (payload.title !== undefined) updateData.title = payload.title.trim()
    if (payload.description !== undefined) updateData.description = payload.description.trim() || undefined
    if (payload.motivation !== undefined) updateData.motivation = payload.motivation.trim() || undefined
    if (payload.emoji !== undefined) updateData.emoji = payload.emoji.trim() || '🎯'
    if (payload.targetDays !== undefined) updateData.targetDays = payload.targetDays
    if (payload.startDate !== undefined) updateData.startDate = payload.startDate
    if (payload.status !== undefined) updateData.status = payload.status
    if (payload.type !== undefined) updateData.type = payload.type
    if (payload.resetOnMiss !== undefined) updateData.resetOnMiss = payload.resetOnMiss
    if (payload.freezeDaysPerMonth !== undefined) {
      updateData.freezeDaysPerMonth = Math.min(7, Math.max(0, payload.freezeDaysPerMonth))
    }
    if (payload.checkins !== undefined) updateData.checkins = payload.checkins
    if (payload.slipDates !== undefined) updateData.slipDates = payload.slipDates
    if (payload.freezeDates !== undefined) updateData.freezeDates = payload.freezeDates

    const updated = await ChallengeModel.findOneAndUpdate(
      { _id: toObjectId(id), userId: toObjectId(userId) },
      updateData,
      { new: true }
    ).lean()

    if (!updated) return null
    return { ...updated, id: updated._id.toString() } as unknown as ChallengeModelType
  },

  delete: async (id: string, userId: string): Promise<boolean> => {
    const result = await ChallengeModel.deleteOne({
      _id: toObjectId(id),
      userId: toObjectId(userId)
    })
    return result.deletedCount > 0
  },

  toggleCheckin: async (
    id: string,
    userId: string,
    date: string
  ): Promise<{ challenge: ChallengeModelType | null; completedToday: boolean }> => {
    const challenge = await ChallengeModel.findOne({
      _id: toObjectId(id),
      userId: toObjectId(userId)
    })

    if (!challenge) {
      return { challenge: null, completedToday: false }
    }

    const exists = challenge.checkins.includes(date)
    let newCheckins: string[]

    if (exists) {
      newCheckins = challenge.checkins.filter((d) => d !== date)
    } else {
      newCheckins = [...challenge.checkins, date].sort()
    }

    challenge.checkins = newCheckins

    // Check completion condition
    if (newCheckins.length >= challenge.targetDays) {
      challenge.status = 'completed'
    } else if (challenge.status === 'completed' && newCheckins.length < challenge.targetDays) {
      challenge.status = 'active'
    }

    await challenge.save()

    const result = challenge.toObject()
    return {
      challenge: { ...result, id: result._id.toString() } as unknown as ChallengeModelType,
      completedToday: !exists
    }
  },

  recordSlip: async (
    id: string,
    userId: string,
    date: string,
    resetCheckins = false
  ): Promise<ChallengeModelType | null> => {
    const challenge = await ChallengeModel.findOne({
      _id: toObjectId(id),
      userId: toObjectId(userId)
    })

    if (!challenge) return null

    const slips = challenge.slipDates || []
    if (!slips.includes(date)) {
      challenge.slipDates = [...slips, date].sort()
    }

    if (resetCheckins) {
      // Se optou por resetar a contagem contínua para recomeçar o streak:
      challenge.checkins = []
    }

    await challenge.save()
    const result = challenge.toObject()
    return { ...result, id: result._id.toString() } as unknown as ChallengeModelType
  },

  toggleFreeze: async (
    id: string,
    userId: string,
    date: string
  ): Promise<{ challenge: ChallengeModelType | null; frozen: boolean; error?: string }> => {
    const challenge = await ChallengeModel.findOne({
      _id: toObjectId(id),
      userId: toObjectId(userId)
    })

    if (!challenge) {
      return { challenge: null, frozen: false }
    }

    const freezes = challenge.freezeDates || []
    const exists = freezes.includes(date)

    if (exists) {
      challenge.freezeDates = freezes.filter((d) => d !== date)
      await challenge.save()
      const result = challenge.toObject()
      return {
        challenge: { ...result, id: result._id.toString() } as unknown as ChallengeModelType,
        frozen: false
      }
    }

    const targetMonth = date.slice(0, 7)
    const usedInMonth = freezes.filter((d) => d.startsWith(targetMonth)).length
    const maxAllowed = typeof challenge.freezeDaysPerMonth === 'number' ? challenge.freezeDaysPerMonth : 2

    if (usedInMonth >= maxAllowed) {
      const result = challenge.toObject()
      return {
        challenge: { ...result, id: result._id.toString() } as unknown as ChallengeModelType,
        frozen: false,
        error: `Limite mensal de ${maxAllowed} dias livres atingido para este mês.`
      }
    }

    challenge.freezeDates = [...freezes, date].sort()
    await challenge.save()
    const result = challenge.toObject()
    return {
      challenge: { ...result, id: result._id.toString() } as unknown as ChallengeModelType,
      frozen: true
    }
  }
}

export default challengeRepository
