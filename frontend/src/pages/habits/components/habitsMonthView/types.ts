import type { DaySummaryResponse } from '@actions/habits/types'
import type { CalendarDayCell } from '@pages/habits/types'

export interface HabitsMonthViewProps {
  monthCells: CalendarDayCell[]
  rangeSummariesMap: Map<string, DaySummaryResponse>
  selectedDate: string
  onSelectDate: (date: string) => void
  onToggleCheckin: (habitId: string, date: string) => void
}
