export interface HabitsHeaderProps {
  selectedDate: string
  formattedDate: string
  isToday: boolean
  onPreviousDay: () => void
  onNextDay: () => void
  onToday: () => void
  onOpenNewHabitModal: () => void
}
