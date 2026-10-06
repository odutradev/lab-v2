import type { CreateHabitFormData } from '@pages/habits/components/habitsModal/types'
import type { DaySummaryResponse, Habit } from '@actions/habits/types'

export interface UseHabitsPageReturn {
  selectedDate: string
  formattedDate: string
  isToday: boolean
  daySummary: DaySummaryResponse | null
  habits: Habit[]
  dayHabitIds: Set<string>
  isLoading: boolean
  isCreating: boolean
  isScheduling: boolean
  togglingId: string | null
  isModalOpen: boolean
  handlePreviousDay: () => void
  handleNextDay: () => void
  handleToday: () => void
  handleOpenModal: () => void
  handleCloseModal: () => void
  handleCreateHabit: (data: CreateHabitFormData) => Promise<void>
  handleToggleCheckin: (habitId: string) => Promise<void>
  handleScheduleForDay: (habitId: string) => Promise<void>
  handleRemoveHabit: (habitId: string) => Promise<void>
}
