import type { DaySummaryResponse } from '@actions/habits/types'

export interface HabitsWeekViewProps {
  weekDays: string[]
  todayStr: string
  rangeSummariesMap: Map<string, DaySummaryResponse>
  selectedDate: string
  togglingId: string | null
  onSelectDate: (date: string) => void
  onToggleCheckin: (habitId: string, date: string) => void
  onEditItem?: (habitId: string, date: string) => void
}
