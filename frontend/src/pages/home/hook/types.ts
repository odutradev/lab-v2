import type { UserProfile } from '@projectTypes/user'
import type { HealthProfile, WeightRecord } from '@stores/health/types'

export interface UseHomePageReturn {
  user: UserProfile | null
  token: string | null
  actionLoading: boolean
  actionResult: string | null
  handleFetchProfile: () => Promise<void>
  handleNavigateResetPassword: () => void
  handleNavigateHabits: () => void

  // Métricas de Saúde & Personagem
  healthProfile: HealthProfile
  weightHistory: WeightRecord[]
  latestWeight?: number
  consumedWaterBottles: number
  extraWaterBottlesTarget: number
  handleUpdateHealthProfile: (data: Partial<HealthProfile>) => void
  handleSaveWeight: (weight: number, date?: string) => void
  handleToggleWaterBottle: (index: number) => void
  handleAddExtraWaterBottle: () => void
  handleResetTodayWater: () => void
}
