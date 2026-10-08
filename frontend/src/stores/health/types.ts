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
  height?: number // em cm (ex: 175)
  characterId: CharacterId
}

export interface WeightRecord {
  date: string // YYYY-MM-DD
  weight: number // em kg
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
  positionPercent: number // 0% a 100% para o medidor visual
}

export interface WaterDayData {
  consumedBottles: number
  targetBottles: number
  bottleSizeMl: number
  totalConsumedMl: number
  targetMl: number
  percentage: number
}

export interface HealthStoreState {
  profile: HealthProfile
  weightHistory: WeightRecord[]
  waterDailyMap: Record<string, number> // YYYY-MM-DD -> garrafas consumidas
  waterExtraTargetMap: Record<string, number> // YYYY-MM-DD -> garrafas extras adicionadas à meta
  waterBottleMl: number // ml por garrafa (default: 500)
  waterTargetBottles?: number // quantidade fixa de garrafas de meta (se definida)

  syncFromApi: (data?: Partial<UserHealth>) => void
  updateProfile: (data: Partial<HealthProfile>) => Promise<void>
  saveWeightRecord: (weight: number, date?: string) => Promise<void>
  toggleWaterBottle: (index: number, date?: string) => Promise<void>
  addExtraWaterBottle: (date?: string) => Promise<void>
  removeExtraWaterBottle: (date?: string) => Promise<void>
  resetTodayWater: (date?: string) => Promise<void>
  updateWaterSettings: (settings: { bottleMl?: number; targetBottles?: number }) => Promise<void>
}
