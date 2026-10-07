import type { Habit, HabitCategory, HabitFrequency, HabitRecurrence } from '@actions/habits/types'

export interface CreateHabitFormData {
  title: string
  description?: string
  category?: HabitCategory
  frequency?: HabitFrequency
  startDate: string
  allDay: boolean
  startTime?: string
  endTime?: string
  recurrence?: HabitRecurrence
}

export interface HabitsModalProps {
  isOpen: boolean
  isLoading: boolean
  initialDate?: string
  initialHabit?: Habit | null
  onClose: () => void
  onSubmit: (data: CreateHabitFormData) => Promise<void>
  onDelete?: (habitId: string) => void
}


