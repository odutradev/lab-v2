import type { MonthlyMetricsResponse } from '@actions/habits/types'

export interface GeneralPerformanceCardProps {
  metrics: MonthlyMetricsResponse | null
  isLoading?: boolean
  selectedDate?: string
  hoveredDate?: string | null
  onSelectDate?: (date: string) => void
  onHoverDate?: (date: string | null) => void
}
