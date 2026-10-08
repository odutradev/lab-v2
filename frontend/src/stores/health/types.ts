import type { UserHealth } from '@projectTypes/user'

export type CharacterId = 'spark' | 'athlete' | 'zen' | 'cyber'

export interface CharacterInfo {
  id: CharacterId
  name: string
  title: string
  avatarUrl?: string
  gradient: { from: string; to: string }
}

export interface HealthProfile {
  age?: number
  height?: number
  characterId: CharacterId
}

export interface WeightRecord {
  date: string
  weight: number
}

export type ImcCategoryKey = 'underweight' | 'normal' | 'overweight' | 'obesity1' | 'obesity2'

export interface ImcClassification {
  key: ImcCategoryKey
  label: string
  rangeLabel: string
  color: string
  badgeVariant: 'primary' | 'success' | 'warning' | 'danger'
  description: string
}

export interface ImcResult {
  imc: number
  classification: ImcClassification
  minIdealWeight: number
  maxIdealWeight: number
  positionPercent: number
}

export interface WaterDayData {
  consumedBottles: number
  targetBottles: number
  bottleSizeMl: number
  totalConsumedMl: number
  targetMl: number
  percentage: number
}

export interface SleepRecord {
  date: string
  hours: number
  quality: number
}

export interface SleepQualityOption {
  value: number
  emoji: string
  label: string
  color: string
}

export interface HealthStoreState {
  profile: HealthProfile
  weightHistory: WeightRecord[]
  sleepHistory: SleepRecord[]
  waterDailyMap: Record<string, number>
  waterExtraTargetMap: Record<string, number>
  waterBottleMl: number
  waterTargetBottles?: number

  syncFromApi: (data?: Partial<UserHealth>) => void
  updateProfile: (data: Partial<HealthProfile>) => Promise<void>
  saveWeightRecord: (weight: number, date?: string) => Promise<void>
  saveSleepRecord: (hours: number, quality: number, date?: string) => Promise<void>
  toggleWaterBottle: (index: number, date?: string) => Promise<void>
  addExtraWaterBottle: (date?: string) => Promise<void>
  removeExtraWaterBottle: (date?: string) => Promise<void>
  resetTodayWater: (date?: string) => Promise<void>
  updateWaterSettings: (settings: { bottleMl?: number; targetBottles?: number }) => Promise<void>
}
