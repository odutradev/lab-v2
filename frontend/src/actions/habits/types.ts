export type HabitFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' | 'none'
export type HabitCategory = 'habit' | 'task' | 'schedule' | 'event'

export interface HabitRecurrence {
  type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  interval?: number
  unit?: 'day' | 'week' | 'month' | 'year'
  daysOfWeek?: number[]
  endType?: 'never' | 'on_date' | 'after_occurrences'
  endDate?: string
  occurrences?: number
}

export type RecurrenceScopeMode = 'this' | 'following' | 'all'

export interface Habit {
  id: string
  userId: string
  title: string
  description?: string
  category?: HabitCategory
  frequency: HabitFrequency
  startDate?: string
  allDay?: boolean
  startTime?: string | null
  endTime?: string | null
  recurrence?: HabitRecurrence
  excludedDates?: string[]
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateHabitPayload {
  title: string
  description?: string
  category?: HabitCategory
  frequency?: HabitFrequency
  startDate?: string
  allDay?: boolean
  startTime?: string | null
  endTime?: string | null
  recurrence?: HabitRecurrence
  excludedDates?: string[]
}

export interface UpdateHabitPayload {
  title?: string
  description?: string
  category?: HabitCategory
  frequency?: HabitFrequency
  startDate?: string
  allDay?: boolean
  startTime?: string | null
  endTime?: string | null
  recurrence?: HabitRecurrence
  excludedDates?: string[]
  active?: boolean
  mode?: RecurrenceScopeMode
  date?: string
}

export interface RemoveHabitOptions {
  mode?: RecurrenceScopeMode
  date?: string
}

export interface ListHabitsParams {
  frequency?: HabitFrequency
  category?: HabitCategory
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
  category?: HabitCategory
  frequency?: HabitFrequency
  startDate?: string
  allDay?: boolean
  startTime?: string | null
  endTime?: string | null
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

