import type { CalendarViewMode } from '@pages/habits/types'

export interface HabitsCalendarToolbarProps {
  headerTitle: string
  viewMode: CalendarViewMode
  isToday: boolean
  onViewModeChange: (mode: CalendarViewMode) => void
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  onOpenNewHabitModal: () => void
  onOpenSettingsModal: () => void
}

