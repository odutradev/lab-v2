import type { HabitRecurrence } from '@actions/habits/types'

export interface RecurrenceSelectProps {
  startDate: string
  recurrence?: HabitRecurrence
  onChange: (rec: HabitRecurrence) => void
}
