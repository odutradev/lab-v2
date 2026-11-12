import { create } from 'zustand'

import { STORAGE_KEYS } from '@api/config'
import { updateHealthAction } from '@actions/users/profile'
import type { HealthProfile, HealthStoreState, WeightRecord, SleepRecord, PerformanceWeights } from './types'
import type { UserHealth } from '@projectTypes/user'
import { calculateDailyWaterGoal, getTodayDateString, sortWeightRecords, sortSleepRecords } from './utils'

const HEALTH_STORAGE_KEY = 'lab_health_metrics_v1'

const defaultPerformanceWeights: PerformanceWeights = {
  habits: 50,
  water: 25,
  sleep: 25
}

interface PersistedData {
  profile: HealthProfile
  weightHistory: WeightRecord[]
  sleepHistory: SleepRecord[]
  waterDailyMap: Record<string, number>
  waterExtraTargetMap: Record<string, number>
  waterBottleMl?: number
  waterTargetBottles?: number
  performanceWeights?: PerformanceWeights
}

const defaultProfile: HealthProfile = {
  characterId: 'spark',
  age: undefined,
  height: undefined
}

const loadPersistedData = (): PersistedData => {
  try {
    const raw = localStorage.getItem(HEALTH_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedData>
      return {
        profile: { ...defaultProfile, ...(parsed.profile || {}) },
        weightHistory: Array.isArray(parsed.weightHistory) ? parsed.weightHistory : [],
        sleepHistory: Array.isArray(parsed.sleepHistory) ? parsed.sleepHistory : [],
        waterDailyMap: parsed.waterDailyMap || {},
        waterExtraTargetMap: parsed.waterExtraTargetMap || {},
        waterBottleMl: typeof parsed.waterBottleMl === 'number' ? parsed.waterBottleMl : 500,
        waterTargetBottles: typeof parsed.waterTargetBottles === 'number' ? parsed.waterTargetBottles : undefined,
        performanceWeights: parsed.performanceWeights || defaultPerformanceWeights
      }
    }
  } catch (err) {
    console.error('Failed to parse health storage data', err)
  }

  return {
    profile: defaultProfile,
    weightHistory: [],
    sleepHistory: [],
    waterDailyMap: {},
    waterExtraTargetMap: {},
    waterBottleMl: 500,
    waterTargetBottles: undefined,
    performanceWeights: defaultPerformanceWeights
  }
}

const saveToLocalStorage = (data: PersistedData) => {
  try {
    const existing = loadPersistedData()
    const merged: PersistedData = {
      ...existing,
      ...data,
      performanceWeights: data.performanceWeights || existing.performanceWeights || defaultPerformanceWeights
    }
    localStorage.setItem(HEALTH_STORAGE_KEY, JSON.stringify(merged))
  } catch (err) {
    console.error('Failed to save health storage data', err)
  }
}

const syncWithBackend = async (payload: Partial<UserHealth>) => {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    if (!token) return
    await updateHealthAction(payload)
  } catch (err) {
    console.error('Failed to sync health metrics to API', err)
  }
}

export const useHealthStore = create<HealthStoreState>((set, get) => {
  const initial = loadPersistedData()

  return {
    profile: initial.profile,
    weightHistory: initial.weightHistory,
    sleepHistory: initial.sleepHistory,
    waterDailyMap: initial.waterDailyMap,
    waterExtraTargetMap: initial.waterExtraTargetMap,
    waterBottleMl: initial.waterBottleMl || 500,
    waterTargetBottles: initial.waterTargetBottles,
    performanceWeights: initial.performanceWeights || defaultPerformanceWeights,

    syncFromApi: (data?: Partial<UserHealth>) => {
      if (!data) return
      const current = get()
      const newProfile: HealthProfile = {
        characterId: (data.characterId as HealthProfile['characterId']) || current.profile.characterId,
        height: typeof data.height === 'number' ? data.height : current.profile.height,
        age: typeof data.age === 'number' ? data.age : current.profile.age
      }

      const newWeightHistory = Array.isArray(data.weightHistory) && data.weightHistory.length > 0
        ? data.weightHistory
        : current.weightHistory

      const newSleepHistory = Array.isArray(data.sleepHistory) && data.sleepHistory.length > 0
        ? data.sleepHistory
        : current.sleepHistory

      const newWaterDailyMap = data.waterDailyMap || current.waterDailyMap
      const newWaterExtraTargetMap = data.waterExtraTargetMap || current.waterExtraTargetMap
      const newWaterBottleMl = typeof data.waterBottleMl === 'number' ? data.waterBottleMl : current.waterBottleMl
      const newWaterTargetBottles = typeof data.waterTargetBottles === 'number' ? data.waterTargetBottles : current.waterTargetBottles
      const newPerformanceWeights = data.performanceWeights && typeof data.performanceWeights === 'object'
        ? {
            habits: typeof data.performanceWeights.habits === 'number' ? data.performanceWeights.habits : current.performanceWeights.habits,
            water: typeof data.performanceWeights.water === 'number' ? data.performanceWeights.water : current.performanceWeights.water,
            sleep: typeof data.performanceWeights.sleep === 'number' ? data.performanceWeights.sleep : current.performanceWeights.sleep
          }
        : current.performanceWeights

      set({
        profile: newProfile,
        weightHistory: newWeightHistory,
        sleepHistory: newSleepHistory,
        waterDailyMap: newWaterDailyMap,
        waterExtraTargetMap: newWaterExtraTargetMap,
        waterBottleMl: newWaterBottleMl,
        waterTargetBottles: newWaterTargetBottles,
        performanceWeights: newPerformanceWeights
      })

      saveToLocalStorage({
        profile: newProfile,
        weightHistory: newWeightHistory,
        sleepHistory: newSleepHistory,
        waterDailyMap: newWaterDailyMap,
        waterExtraTargetMap: newWaterExtraTargetMap,
        waterBottleMl: newWaterBottleMl,
        waterTargetBottles: newWaterTargetBottles,
        performanceWeights: newPerformanceWeights
      })
    },

    updatePerformanceWeights: async (weights: PerformanceWeights) => {
      set({ performanceWeights: weights })
      saveToLocalStorage({
        ...get(),
        performanceWeights: weights
      })

      await syncWithBackend({
        performanceWeights: weights
      })
    },

    updateProfile: async (data: Partial<HealthProfile>) => {
      const current = get()
      const newProfile: HealthProfile = {
        ...current.profile,
        ...data
      }

      set({ profile: newProfile })
      saveToLocalStorage({
        profile: newProfile,
        weightHistory: current.weightHistory,
        sleepHistory: current.sleepHistory,
        waterDailyMap: current.waterDailyMap,
        waterExtraTargetMap: current.waterExtraTargetMap,
        waterBottleMl: current.waterBottleMl,
        waterTargetBottles: current.waterTargetBottles
      })

      await syncWithBackend({
        height: newProfile.height,
        age: newProfile.age,
        characterId: newProfile.characterId
      })
    },

    saveWeightRecord: async (weight: number, customDate?: string) => {
      const current = get()
      const date = customDate || getTodayDateString()
      const sanitizedWeight = Math.round(weight * 10) / 10

      const filtered = current.weightHistory.filter((item) => item.date !== date)
      const updated = sortWeightRecords([...filtered, { date, weight: sanitizedWeight }])

      set({ weightHistory: updated })
      saveToLocalStorage({
        profile: current.profile,
        weightHistory: updated,
        sleepHistory: current.sleepHistory,
        waterDailyMap: current.waterDailyMap,
        waterExtraTargetMap: current.waterExtraTargetMap,
        waterBottleMl: current.waterBottleMl,
        waterTargetBottles: current.waterTargetBottles
      })

      await syncWithBackend({
        weightHistory: updated
      })
    },

    saveSleepRecord: async (hours: number, quality: number, customDate?: string) => {
      const current = get()
      const date = customDate || getTodayDateString()
      const sanitizedHours = Math.round(Math.max(0, Math.min(24, hours)) * 10) / 10
      const sanitizedQuality = Math.min(5, Math.max(1, Math.round(quality)))

      const filtered = current.sleepHistory.filter((item) => item.date !== date)
      const updated = sortSleepRecords([...filtered, { date, hours: sanitizedHours, quality: sanitizedQuality }])

      set({ sleepHistory: updated })
      saveToLocalStorage({
        profile: current.profile,
        weightHistory: current.weightHistory,
        sleepHistory: updated,
        waterDailyMap: current.waterDailyMap,
        waterExtraTargetMap: current.waterExtraTargetMap,
        waterBottleMl: current.waterBottleMl,
        waterTargetBottles: current.waterTargetBottles
      })

      await syncWithBackend({
        sleepHistory: updated
      })
    },

    toggleWaterBottle: async (index: number, customDate?: string) => {
      const current = get()
      const date = customDate || getTodayDateString()
      const currentConsumed = current.waterDailyMap[date] || 0

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
        sleepHistory: current.sleepHistory,
        waterDailyMap: updatedMap,
        waterExtraTargetMap: current.waterExtraTargetMap,
        waterBottleMl: current.waterBottleMl,
        waterTargetBottles: current.waterTargetBottles
      })

      await syncWithBackend({
        waterDailyMap: updatedMap
      })
    },

    addExtraWaterBottle: async (customDate?: string) => {
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
        sleepHistory: current.sleepHistory,
        waterDailyMap: current.waterDailyMap,
        waterExtraTargetMap: updatedExtras,
        waterBottleMl: current.waterBottleMl,
        waterTargetBottles: current.waterTargetBottles
      })

      await syncWithBackend({
        waterExtraTargetMap: updatedExtras
      })
    },

    removeExtraWaterBottle: async (customDate?: string) => {
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
      const { targetBottles } = calculateDailyWaterGoal(
        latestWeight,
        newExtra,
        current.waterBottleMl,
        current.waterTargetBottles,
        current.profile.age,
        current.profile.height
      )
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
        sleepHistory: current.sleepHistory,
        waterDailyMap: updatedDaily,
        waterExtraTargetMap: updatedExtras,
        waterBottleMl: current.waterBottleMl,
        waterTargetBottles: current.waterTargetBottles
      })

      await syncWithBackend({
        waterExtraTargetMap: updatedExtras,
        waterDailyMap: updatedDaily
      })
    },

    resetTodayWater: async (customDate?: string) => {
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
        sleepHistory: current.sleepHistory,
        waterDailyMap: updatedDaily,
        waterExtraTargetMap: updatedExtras,
        waterBottleMl: current.waterBottleMl,
        waterTargetBottles: current.waterTargetBottles
      })

      await syncWithBackend({
        waterDailyMap: updatedDaily,
        waterExtraTargetMap: updatedExtras
      })
    },

    updateWaterSettings: async ({ bottleMl, targetBottles }: { bottleMl?: number; targetBottles?: number }) => {
      const current = get()
      const newBottleMl = bottleMl !== undefined && bottleMl > 0 ? bottleMl : current.waterBottleMl
      const newTargetBottles = targetBottles !== undefined && targetBottles > 0 ? targetBottles : current.waterTargetBottles

      set({
        waterBottleMl: newBottleMl,
        waterTargetBottles: newTargetBottles
      })

      saveToLocalStorage({
        profile: current.profile,
        weightHistory: current.weightHistory,
        sleepHistory: current.sleepHistory,
        waterDailyMap: current.waterDailyMap,
        waterExtraTargetMap: current.waterExtraTargetMap,
        waterBottleMl: newBottleMl,
        waterTargetBottles: newTargetBottles
      })

      await syncWithBackend({
        waterBottleMl: newBottleMl,
        waterTargetBottles: newTargetBottles
      })
    }
  }
})

export default useHealthStore
