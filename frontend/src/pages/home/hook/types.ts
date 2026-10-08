import type { UserProfile } from '@projectTypes/user'
import type { HealthProfile, WeightRecord, SleepRecord } from '@stores/health/types'

export interface UseHomePageReturn {
  user: UserProfile | null
  token: string | null
  actionLoading: boolean
  actionResult: string | null
  handleFetchProfile: () => Promise<void>
  handleNavigateResetPassword: () => void
  handleNavigateHabits: () => void

  healthProfile: HealthProfile
  weightHistory: WeightRecord[]
  latestWeight?: number
  sleepHistory: SleepRecord[]
  consumedWaterBottles: number
  extraWaterBottlesTarget: number
  handleUpdateHealthProfile: (data: Partial<HealthProfile>) => void
  handleSaveWeight: (weight: number, date?: string) => void
  handleSaveSleep: (hours: number, quality: number, date?: string) => void
  handleToggleWaterBottle: (index: number) => void
  handleAddExtraWaterBottle: () => void
  handleResetTodayWater: () => void
}
