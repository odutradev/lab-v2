import { create } from 'zustand'

import type { HealthProfile, HealthStoreState, WeightRecord } from './types'
import { calculateDailyWaterGoal, getTodayDateString, sortWeightRecords } from './utils'

const HEALTH_STORAGE_KEY = 'lab_health_metrics_v1'

interface PersistedData {
  profile: HealthProfile
  weightHistory: WeightRecord[]
  waterDailyMap: Record<string, number>
  waterExtraTargetMap: Record<string, number>
}

const defaultProfile: HealthProfile = {
  characterId: 'spark',
  age: 26,
  height: 175
}

const loadPersistedData = (): PersistedData => {
  try {
    const raw = localStorage.getItem(HEALTH_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedData>
      return {
        profile: { ...defaultProfile, ...(parsed.profile || {}) },
        weightHistory: Array.isArray(parsed.weightHistory) ? parsed.weightHistory : [],
        waterDailyMap: parsed.waterDailyMap || {},
        waterExtraTargetMap: parsed.waterExtraTargetMap || {}
      }
    }
  } catch (err) {
    console.error('Failed to parse health storage data', err)
  }

  return {
    profile: defaultProfile,
    weightHistory: [],
    waterDailyMap: {},
    waterExtraTargetMap: {}
  }
}

const saveToLocalStorage = (data: PersistedData) => {
  try {
    localStorage.setItem(HEALTH_STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Failed to save health storage data', err)
  }
}

export const useHealthStore = create<HealthStoreState>((set, get) => {
  const initial = loadPersistedData()

  return {
    profile: initial.profile,
    weightHistory: initial.weightHistory,
    waterDailyMap: initial.waterDailyMap,
    waterExtraTargetMap: initial.waterExtraTargetMap,

    updateProfile: (data: Partial<HealthProfile>) => {
      const current = get()
      const newProfile: HealthProfile = {
        ...current.profile,
        ...data
      }

      set({ profile: newProfile })
      saveToLocalStorage({
        profile: newProfile,
        weightHistory: current.weightHistory,
        waterDailyMap: current.waterDailyMap,
        waterExtraTargetMap: current.waterExtraTargetMap
      })
    },

    saveWeightRecord: (weight: number, customDate?: string) => {
      const current = get()
      const date = customDate || getTodayDateString()
      const sanitizedWeight = Math.round(weight * 10) / 10

      // Filtra o registro existente na data de hoje e atualiza ou insere (1 registro por dia)
      const filtered = current.weightHistory.filter((item) => item.date !== date)
      const updated = sortWeightRecords([...filtered, { date, weight: sanitizedWeight }])

      set({ weightHistory: updated })
      saveToLocalStorage({
        profile: current.profile,
        weightHistory: updated,
        waterDailyMap: current.waterDailyMap,
        waterExtraTargetMap: current.waterExtraTargetMap
      })
    },

    toggleWaterBottle: (index: number, customDate?: string) => {
      const current = get()
      const date = customDate || getTodayDateString()
      const currentConsumed = current.waterDailyMap[date] || 0

      // Se o usuário clicar na garrafa index (0-indexed):
      // Se clicou na garrafa atual ou além, define até ela (index + 1)
      // Se clicou na última garrafa consumida, remove ela (index)
      let newCount = index + 1
      if (currentConsumed === index + 1) {
        newCount = index
      }

      const updatedMap = {
        ...current.waterDailyMap,
        [date]: Math.max(0, newCount)
      }

      set({ waterDailyMap: updatedMap })
      saveToLocalStorage({
        profile: current.profile,
        weightHistory: current.weightHistory,
        waterDailyMap: updatedMap,
        waterExtraTargetMap: current.waterExtraTargetMap
      })
    },

    addExtraWaterBottle: (customDate?: string) => {
      const current = get()
      const date = customDate || getTodayDateString()
      const currentExtra = current.waterExtraTargetMap[date] || 0

      const updatedExtras = {
        ...current.waterExtraTargetMap,
        [date]: currentExtra + 1
      }

      set({ waterExtraTargetMap: updatedExtras })
      saveToLocalStorage({
        profile: current.profile,
        weightHistory: current.weightHistory,
        waterDailyMap: current.waterDailyMap,
        waterExtraTargetMap: updatedExtras
      })
    },

    removeExtraWaterBottle: (customDate?: string) => {
      const current = get()
      const date = customDate || getTodayDateString()
      const currentExtra = current.waterExtraTargetMap[date] || 0
      if (currentExtra <= 0) return

      const newExtra = currentExtra - 1
      const updatedExtras = {
        ...current.waterExtraTargetMap,
        [date]: newExtra
      }

      const latestWeight =
        current.weightHistory.length > 0
          ? current.weightHistory[current.weightHistory.length - 1].weight
          : undefined
      const { targetBottles } = calculateDailyWaterGoal(latestWeight, newExtra)
      const currentConsumed = current.waterDailyMap[date] || 0
      const updatedDaily = {
        ...current.waterDailyMap,
        [date]: Math.min(currentConsumed, targetBottles)
      }

      set({
        waterExtraTargetMap: updatedExtras,
        waterDailyMap: updatedDaily
      })
      saveToLocalStorage({
        profile: current.profile,
        weightHistory: current.weightHistory,
        waterDailyMap: updatedDaily,
        waterExtraTargetMap: updatedExtras
      })
    },

    resetTodayWater: (customDate?: string) => {
      const current = get()
      const date = customDate || getTodayDateString()

      const updatedDaily = {
        ...current.waterDailyMap,
        [date]: 0
      }

      const updatedExtras = {
        ...current.waterExtraTargetMap,
        [date]: 0
      }

      set({
        waterDailyMap: updatedDaily,
        waterExtraTargetMap: updatedExtras
      })

      saveToLocalStorage({
        profile: current.profile,
        weightHistory: current.weightHistory,
        waterDailyMap: updatedDaily,
        waterExtraTargetMap: updatedExtras
      })
    }
  }
})

export default useHealthStore
