import type { ImcResult, WeightRecord } from '@stores/health/types'

export interface WeightImcCardProps {
  heightCm?: number
  weightHistory: WeightRecord[]
  onSaveWeight: (weight: number, date?: string) => void
  onOpenPhysicalModal?: () => void
}

export interface WeightHistoryChartProps {
  records: WeightRecord[]
  height?: number
  onStartTodayCheckin?: () => void
}

export interface ImcGaugeChartProps {
  imcResult: ImcResult | null
  heightCm?: number
  currentWeight?: number
  onConfigureHeight?: () => void
}
