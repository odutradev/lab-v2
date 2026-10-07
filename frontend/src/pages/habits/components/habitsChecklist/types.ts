import type { DaySummaryItem } from '@actions/habits/types'

export interface HabitsChecklistProps {
  items: DaySummaryItem[]
  isLoading: boolean
  togglingId: string | null
  onToggle: (habitId: string) => void
  onEdit?: (habitId: string) => void
  onRemove?: (habitId: string) => void
}

