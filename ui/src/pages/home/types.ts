export type CalendarViewMode = 'day' | 'week' | 'month'

export interface CalendarDayCell {
  date: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
}
