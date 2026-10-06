import type { HabitFrequency } from '@actions/habits/types'

export interface CreateHabitFormData {
  title: string
  description?: string
  frequency: HabitFrequency
}

export interface HabitsModalProps {
  isOpen: boolean
  isLoading: boolean
  onClose: () => void
  onSubmit: (data: CreateHabitFormData) => Promise<void>
}
