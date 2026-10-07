import type { Habit } from '@actions/habits/types'

export interface HabitsPoolProps {
  habits: Habit[]
  dayHabitIds: Set<string>
  onScheduleForDay: (habitId: string) => void
  onRemoveHabit: (habitId: string) => void
  onEditHabit?: (habitId: string) => void
  isScheduling: boolean
}
