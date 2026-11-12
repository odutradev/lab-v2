import type { HabitRecurrence } from '@actions/habits/types'

export interface CustomRecurrenceModalProps {
  isOpen: boolean
  initialRecurrence?: HabitRecurrence
  baseDate: string
  onClose: () => void
  onConfirm: (recurrence: HabitRecurrence) => void
}
