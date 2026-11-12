import { create } from "zustand";
import { persist } from "zustand/middleware";

import { storageKeys } from "@assets/config";
import { createRawPersistStorage, readJson, writeJson } from "@utils/functions/storage";
import { updateHealthAction } from "@actions/users/profile";
import type {
  HealthProfile,
  HealthStoreState,
  WeightRecord,
  SleepRecord,
  PerformanceWeights
} from "@stores/health/types";
import type { UserHealth } from "@utils/types/user";
import {
  calculateDailyWaterGoal,
  getTodayDateString,
  sortWeightRecords,
  sortSleepRecords
} from "@utils/functions/health";

const defaultPerformanceWeights: PerformanceWeights = {
  habits: 50,
  water: 25,
  sleep: 25
};

interface PersistedData {
  profile: HealthProfile;
  weightHistory: WeightRecord[];
  sleepHistory: SleepRecord[];
  waterDailyMap: Record<string, number>;
  waterExtraTargetMap: Record<string, number>;
  waterBottleMl?: number;
  waterTargetBottles?: number;
  performanceWeights?: PerformanceWeights;
}

const defaultProfile: HealthProfile = {
  characterId: "spark",
  age: undefined,
  height: undefined
};

const loadPersistedData = (): PersistedData => {
  try {
    const parsed = readJson<Partial<PersistedData>>(storageKeys.healthMetrics);
    if (parsed) {
      return {
        profile: { ...defaultProfile, ...(parsed.profile || {}) },
        weightHistory: Array.isArray(parsed.weightHistory) ? parsed.weightHistory : [],
        sleepHistory: Array.isArray(parsed.sleepHistory) ? parsed.sleepHistory : [],
        waterDailyMap: parsed.waterDailyMap || {},
        waterExtraTargetMap: parsed.waterExtraTargetMap || {},
        waterBottleMl: typeof parsed.waterBottleMl === "number" ? parsed.waterBottleMl : 500,
        waterTargetBottles: typeof parsed.waterTargetBottles === "number" ? parsed.waterTargetBottles : undefined,
        performanceWeights: parsed.performanceWeights || defaultPerformanceWeights
      };
    }
  } catch (err) {
    console.error("Failed to parse health storage data", err);
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
  };
};

const healthStorage = createRawPersistStorage<PersistedData>({
  read: loadPersistedData,
  write: (data) =>
    writeJson(storageKeys.healthMetrics, {
      ...data,
      performanceWeights: data.performanceWeights || defaultPerformanceWeights
    }),
  clear: () => localStorage.removeItem(storageKeys.healthMetrics)
});

const syncWithBackend = async (payload: Partial<UserHealth>) => {
  try {
    const token = localStorage.getItem(storageKeys.token);
    if (!token) return;
    await updateHealthAction(payload);
  } catch (err) {
    console.error("Failed to sync health metrics to API", err);
  }
};

export const useHealthStore = create<HealthStoreState>()(
  persist(
    (set, get) => {
      return {
        profile: defaultProfile,
        weightHistory: [],
        sleepHistory: [],
        waterDailyMap: {},
        waterExtraTargetMap: {},
        waterBottleMl: 500,
        waterTargetBottles: undefined,
        performanceWeights: defaultPerformanceWeights,

        syncFromApi: (data?: Partial<UserHealth>) => {
          if (!data) return;
          const current = get();
          const newProfile: HealthProfile = {
            characterId: (data.characterId as HealthProfile["characterId"]) || current.profile.characterId,
            height: typeof data.height === "number" ? data.height : current.profile.height,
            age: typeof data.age === "number" ? data.age : current.profile.age
          };

          const newWeightHistory =
            Array.isArray(data.weightHistory) && data.weightHistory.length > 0
              ? data.weightHistory
              : current.weightHistory;

          const newSleepHistory =
            Array.isArray(data.sleepHistory) && data.sleepHistory.length > 0 ? data.sleepHistory : current.sleepHistory;

          const newWaterDailyMap = data.waterDailyMap || current.waterDailyMap;
          const newWaterExtraTargetMap = data.waterExtraTargetMap || current.waterExtraTargetMap;
          const newWaterBottleMl = typeof data.waterBottleMl === "number" ? data.waterBottleMl : current.waterBottleMl;
          const newWaterTargetBottles =
            typeof data.waterTargetBottles === "number" ? data.waterTargetBottles : current.waterTargetBottles;
          const newPerformanceWeights =
            data.performanceWeights && typeof data.performanceWeights === "object"
              ? {
                  habits:
                    typeof data.performanceWeights.habits === "number"
                      ? data.performanceWeights.habits
                      : current.performanceWeights.habits,
                  water:
                    typeof data.performanceWeights.water === "number"
                      ? data.performanceWeights.water
                      : current.performanceWeights.water,
                  sleep:
                    typeof data.performanceWeights.sleep === "number"
                      ? data.performanceWeights.sleep
                      : current.performanceWeights.sleep
                }
              : current.performanceWeights;

          set({
            profile: newProfile,
            weightHistory: newWeightHistory,
            sleepHistory: newSleepHistory,
            waterDailyMap: newWaterDailyMap,
            waterExtraTargetMap: newWaterExtraTargetMap,
            waterBottleMl: newWaterBottleMl,
            waterTargetBottles: newWaterTargetBottles,
            performanceWeights: newPerformanceWeights
          });
        },

        updatePerformanceWeights: async (weights: PerformanceWeights) => {
          set({ performanceWeights: weights });

          await syncWithBackend({
            performanceWeights: weights
          });
        },

        updateProfile: async (data: Partial<HealthProfile>) => {
          const current = get();
          const newProfile: HealthProfile = {
            ...current.profile,
            ...data
          };

          set({ profile: newProfile });

          await syncWithBackend({
            height: newProfile.height,
            age: newProfile.age,
            characterId: newProfile.characterId
          });
        },

        saveWeightRecord: async (weight: number, customDate?: string) => {
          const current = get();
          const date = customDate || getTodayDateString();
          const sanitizedWeight = Math.round(weight * 10) / 10;

          const filtered = current.weightHistory.filter((item) => item.date !== date);
          const updated = sortWeightRecords([...filtered, { date, weight: sanitizedWeight }]);

          set({ weightHistory: updated });

          await syncWithBackend({
            weightHistory: updated
          });
        },

        saveSleepRecord: async (hours: number, quality: number, customDate?: string) => {
          const current = get();
          const date = customDate || getTodayDateString();
          const sanitizedHours = Math.round(Math.max(0, Math.min(24, hours)) * 10) / 10;
          const sanitizedQuality = Math.min(5, Math.max(1, Math.round(quality)));

          const filtered = current.sleepHistory.filter((item) => item.date !== date);
          const updated = sortSleepRecords([...filtered, { date, hours: sanitizedHours, quality: sanitizedQuality }]);

          set({ sleepHistory: updated });

          await syncWithBackend({
            sleepHistory: updated
          });
        },

        toggleWaterBottle: async (index: number, customDate?: string) => {
          const current = get();
          const date = customDate || getTodayDateString();
          const currentConsumed = current.waterDailyMap[date] || 0;

          const newCount = currentConsumed === index + 1 ? index : index + 1;

          const updatedMap = {
            ...current.waterDailyMap,
            [date]: Math.max(0, newCount)
          };

          set({ waterDailyMap: updatedMap });

          await syncWithBackend({
            waterDailyMap: updatedMap
          });
        },

        addExtraWaterBottle: async (customDate?: string) => {
          const current = get();
          const date = customDate || getTodayDateString();
          const currentExtra = current.waterExtraTargetMap[date] || 0;

          const updatedExtras = {
            ...current.waterExtraTargetMap,
            [date]: currentExtra + 1
          };

          set({ waterExtraTargetMap: updatedExtras });

          await syncWithBackend({
            waterExtraTargetMap: updatedExtras
          });
        },

        removeExtraWaterBottle: async (customDate?: string) => {
          const current = get();
          const date = customDate || getTodayDateString();
          const currentExtra = current.waterExtraTargetMap[date] || 0;
          if (currentExtra <= 0) return;

          const newExtra = currentExtra - 1;
          const updatedExtras = {
            ...current.waterExtraTargetMap,
            [date]: newExtra
          };

          const latestWeight =
            current.weightHistory.length > 0
              ? current.weightHistory[current.weightHistory.length - 1].weight
              : undefined;
          const { targetBottles } = calculateDailyWaterGoal(
            latestWeight,
            newExtra,
            current.waterBottleMl,
            current.waterTargetBottles,
            current.profile.age,
            current.profile.height
          );
          const currentConsumed = current.waterDailyMap[date] || 0;
          const updatedDaily = {
            ...current.waterDailyMap,
            [date]: Math.min(currentConsumed, targetBottles)
          };

          set({
            waterExtraTargetMap: updatedExtras,
            waterDailyMap: updatedDaily
          });

          await syncWithBackend({
            waterExtraTargetMap: updatedExtras,
            waterDailyMap: updatedDaily
          });
        },

        resetTodayWater: async (customDate?: string) => {
          const current = get();
          const date = customDate || getTodayDateString();

          const updatedDaily = {
            ...current.waterDailyMap,
            [date]: 0
          };

          const updatedExtras = {
            ...current.waterExtraTargetMap,
            [date]: 0
          };

          set({
            waterDailyMap: updatedDaily,
            waterExtraTargetMap: updatedExtras
          });

          await syncWithBackend({
            waterDailyMap: updatedDaily,
            waterExtraTargetMap: updatedExtras
          });
        },

        updateWaterSettings: async ({ bottleMl, targetBottles }: { bottleMl?: number; targetBottles?: number }) => {
          const current = get();
          const newBottleMl = bottleMl !== undefined && bottleMl > 0 ? bottleMl : current.waterBottleMl;
          const newTargetBottles =
            targetBottles !== undefined && targetBottles > 0 ? targetBottles : current.waterTargetBottles;

          set({
            waterBottleMl: newBottleMl,
            waterTargetBottles: newTargetBottles
          });

          await syncWithBackend({
            waterBottleMl: newBottleMl,
            waterTargetBottles: newTargetBottles
          });
        }
      };
    },
    {
      name: storageKeys.healthMetrics,
      storage: healthStorage,
      partialize: (state) => ({
        profile: state.profile,
        weightHistory: state.weightHistory,
        sleepHistory: state.sleepHistory,
        waterDailyMap: state.waterDailyMap,
        waterExtraTargetMap: state.waterExtraTargetMap,
        waterBottleMl: state.waterBottleMl || 500,
        waterTargetBottles: state.waterTargetBottles,
        performanceWeights: state.performanceWeights || defaultPerformanceWeights
      })
    }
  )
);

export default useHealthStore;
