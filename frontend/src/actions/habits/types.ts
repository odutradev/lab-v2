export type HabitFrequency = 'daily' | 'weekly' | 'monthly'

export interface Habit {
  id: string
  userId: string
  title: string
  description?: string
  frequency: HabitFrequency
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateHabitPayload {
  title: string
  description?: string
  frequency: HabitFrequency
}

export interface UpdateHabitPayload {
  title?: string
  description?: string
  frequency?: HabitFrequency
  active?: boolean
}

export interface ListHabitsParams {
  frequency?: HabitFrequency
  active?: boolean
}

export interface ScheduleHabitPayload {
  habitId: string
  date: string
}

export interface ToggleCheckinPayload {
  habitId: string
  date?: string
  completed?: boolean
}

export interface ToggleCheckinResponse {
  habitId: string
  date: string
  completed: boolean
}

export interface DaySummaryItem {
  habitId: string
  title: string
  description?: string
  frequency: HabitFrequency
  completed: boolean
}

export interface DaySummaryResponse {
  date: string
  totalHabits: number
  completedHabits: number
  completionRate: number
  items: DaySummaryItem[]
}

export interface RangeSummaryParams {
  startDate: string
  endDate: string
}

export interface HabitActionSuccessResponse {
  success: boolean
}
