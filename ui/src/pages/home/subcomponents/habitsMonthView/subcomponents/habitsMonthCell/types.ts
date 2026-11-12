import type { DaySummaryResponse } from '@actions/habits/types'
import type { CalendarDayCell } from '../../../../types'

export interface HabitsMonthCellProps {
  cell: CalendarDayCell
  summary?: DaySummaryResponse
  isSelected: boolean
  onSelectDate: (date: string) => void
  onToggleCheckin: (habitId: string, date: string) => void
  onEditItem?: (habitId: string, date: string) => void
}
