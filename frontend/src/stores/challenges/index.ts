import { create } from 'zustand'

import challengesActions from '@actions/challenges'
import { getTodayDateString } from './utils'

import type {
  Challenge,
  CreateChallengePayload,
  UpdateChallengePayload,
  SlipChallengePayload
} from '@actions/challenges/types'

interface ChallengesState {
  challenges: Challenge[]
  isLoading: boolean
  isActionLoading: boolean
  fetchChallenges: () => Promise<void>
  createChallenge: (payload: CreateChallengePayload) => Promise<Challenge>
  updateChallenge: (id: string, payload: UpdateChallengePayload) => Promise<Challenge>
  removeChallenge: (id: string) => Promise<void>
  toggleCheckin: (id: string, date?: string) => Promise<{ completedToday: boolean; challenge: Challenge }>
  recordSlip: (id: string, payload?: SlipChallengePayload) => Promise<Challenge>
  toggleFreeze: (id: string, date?: string) => Promise<{ frozen: boolean; challenge: Challenge; error?: string }>
}

export const useChallengesStore = create<ChallengesState>((set, get) => ({
  challenges: [],
  isLoading: false,
  isActionLoading: false,

  fetchChallenges: async () => {
    set({ isLoading: true })
    try {
      const items = await challengesActions.listChallenges()
      set({ challenges: items, isLoading: false })
    } catch (err) {
      console.error('Failed to fetch challenges', err)
      set({ isLoading: false })
    }
  },

  createChallenge: async (payload: CreateChallengePayload) => {
    set({ isActionLoading: true })
    try {
      const created = await challengesActions.createChallenge(payload)
      set((state) => ({
        challenges: [created, ...state.challenges],
        isActionLoading: false
      }))
      return created
    } catch (err) {
      set({ isActionLoading: false })
      throw err
    }
  },

  updateChallenge: async (id: string, payload: UpdateChallengePayload) => {
    set({ isActionLoading: true })
    try {
      const updated = await challengesActions.updateChallenge(id, payload)
      set((state) => ({
        challenges: state.challenges.map((c) => (c.id === id ? updated : c)),
        isActionLoading: false
      }))
      return updated
    } catch (err) {
      set({ isActionLoading: false })
      throw err
    }
  },

  removeChallenge: async (id: string) => {
    set({ isActionLoading: true })
    try {
      await challengesActions.removeChallenge(id)
      set((state) => ({
        challenges: state.challenges.filter((c) => c.id !== id),
        isActionLoading: false
      }))
    } catch (err) {
      set({ isActionLoading: false })
      throw err
    }
  },

  toggleCheckin: async (id: string, date?: string) => {
    const targetDate = date || getTodayDateString()
    const currentChallenge = get().challenges.find((c) => c.id === id)

    // Otimistic update
    if (currentChallenge) {
      const exists = currentChallenge.checkins.includes(targetDate)
      const nextCheckins = exists
        ? currentChallenge.checkins.filter((d) => d !== targetDate)
        : [...currentChallenge.checkins, targetDate].sort()

      const optimisticStatus = nextCheckins.length >= currentChallenge.targetDays ? 'completed' : 'active'

      set((state) => ({
        challenges: state.challenges.map((c) =>
          c.id === id ? { ...c, checkins: nextCheckins, status: optimisticStatus } : c
        )
      }))
    }

    try {
      const response = await challengesActions.checkinChallenge(id, { date: targetDate })
      set((state) => ({
        challenges: state.challenges.map((c) => (c.id === id ? response.challenge : c))
      }))
      return response
    } catch (err) {
      // Revert if error
      if (currentChallenge) {
        set((state) => ({
          challenges: state.challenges.map((c) => (c.id === id ? currentChallenge : c))
        }))
      }
      throw err
    }
  },

  recordSlip: async (id: string, payload?: SlipChallengePayload) => {
    set({ isActionLoading: true })
    try {
      const updated = await challengesActions.slipChallenge(id, payload)
      set((state) => ({
        challenges: state.challenges.map((c) => (c.id === id ? updated : c)),
        isActionLoading: false
      }))
      return updated
    } catch (err) {
      set({ isActionLoading: false })
      throw err
    }
  },

  toggleFreeze: async (id: string, date?: string) => {
    const targetDate = date || getTodayDateString()
    set({ isActionLoading: true })
    try {
      const response = await challengesActions.freezeChallenge(id, { date: targetDate })
      set((state) => ({
        challenges: state.challenges.map((c) => (c.id === id ? response.challenge : c)),
        isActionLoading: false
      }))
      return response
    } catch (err) {
      set({ isActionLoading: false })
      throw err
    }
  }
}))

export default useChallengesStore
