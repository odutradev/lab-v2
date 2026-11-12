import type { WeightRecord } from '@stores/health/types'

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
