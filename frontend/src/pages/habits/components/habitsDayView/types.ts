import type { DaySummaryResponse } from '@actions/habits/types'

export interface HabitsDayViewProps {
  selectedDate: string
  isToday: boolean
  daySummary: DaySummaryResponse | null
  isLoading: boolean
  togglingId: string | null
  onToggleCheckin: (habitId: string, date?: string) => void
  onEditItem?: (habitId: string, date?: string) => void
  onRemoveItem?: (habitId: string, date?: string) => void
}
