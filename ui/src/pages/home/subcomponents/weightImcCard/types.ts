import type { ImcResult, WeightRecord } from '@stores/health/types'

export interface WeightImcCardProps {
  heightCm?: number
  weightHistory: WeightRecord[]
  selectedDate?: string
  hoveredDate?: string | null
  onSaveWeight: (weight: number, date?: string) => void
  onHoverDate?: (date: string | null) => void
  onOpenPhysicalModal?: () => void
}

export interface WeightHistoryChartProps {
  records: WeightRecord[]
  height?: number
  selectedYear: number
  selectedMonth: number
  targetDate?: string
  hoveredDate?: string | null
  onOpenCheckinModal: (date?: string) => void
  onHoverDate?: (date: string | null) => void
}

export interface ImcGaugeChartProps {
  imcResult: ImcResult | null
  heightCm?: number
  currentWeight?: number
  onConfigureHeight?: () => void
}
