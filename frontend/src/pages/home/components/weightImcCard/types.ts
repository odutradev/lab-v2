import type { ImcResult, WeightRecord } from '@stores/health/types'

export interface WeightImcCardProps {
  heightCm?: number
  weightHistory: WeightRecord[]
  selectedDate?: string
  onSaveWeight: (weight: number, date?: string) => void
  onOpenPhysicalModal?: () => void
}

export interface WeightHistoryChartProps {
  records: WeightRecord[]
  height?: number
  selectedYear: number
  selectedMonth: number
  targetDate?: string
  onOpenCheckinModal: (date?: string) => void
}

export interface ImcGaugeChartProps {
  imcResult: ImcResult | null
  heightCm?: number
  currentWeight?: number
  onConfigureHeight?: () => void
}
