import type { SleepRecord } from '@stores/health/types'

export interface SleepHistoryChartProps {
  records: SleepRecord[]
  selectedYear: number
  selectedMonth: number
  targetDate?: string
  hoveredDate?: string | null
  onOpenCheckinModal: (date?: string) => void
  onHoverDate?: (date: string | null) => void
}
