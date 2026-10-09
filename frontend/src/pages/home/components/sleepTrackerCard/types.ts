import type { SleepRecord } from '@stores/health/types'

export interface SleepTrackerCardProps {
  sleepHistory: SleepRecord[]
  selectedDate?: string
  hoveredDate?: string | null
  onSaveSleep: (hours: number, quality: number, date?: string) => void
  onHoverDate?: (date: string | null) => void
}

export interface SleepHistoryChartProps {
  records: SleepRecord[]
  selectedYear: number
  selectedMonth: number
  targetDate?: string
  hoveredDate?: string | null
  onOpenCheckinModal: (date?: string) => void
  onHoverDate?: (date: string | null) => void
}
