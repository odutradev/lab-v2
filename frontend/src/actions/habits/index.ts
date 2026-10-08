import apiClient from '@api/client'

import type { RemoveHabitOptions, HabitActionSuccessResponse, ToggleCheckinResponse, ScheduleHabitPayload, ToggleCheckinPayload, RangeSummaryParams, CreateHabitPayload, UpdateHabitPayload, DaySummaryResponse, ListHabitsParams, Habit, MonthlyMetricsPayload, MonthlyMetricsResponse } from './types'

export const createHabitAction = async (payload: CreateHabitPayload): Promise<Habit> => {
  return apiClient.post<Habit>('/habits/create', payload)
}

export const listHabitsAction = async (params?: ListHabitsParams): Promise<Habit[]> => {
  const query = new URLSearchParams()
  if (params?.frequency) query.append('frequency', params.frequency)
  if (typeof params?.active === 'boolean') query.append('active', String(params.active))

  const queryString = query.toString() ? `?${query.toString()}` : ''
  return apiClient.get<Habit[]>(`/habits/list${queryString}`)
}

export const updateHabitAction = async (id: string, payload: UpdateHabitPayload): Promise<Habit> => {
  return apiClient.patch<Habit>(`/habits/${id}/update`, payload)
}

export const removeHabitAction = async (id: string, options?: RemoveHabitOptions): Promise<HabitActionSuccessResponse> => {
  const query = new URLSearchParams()
  if (options?.mode) query.append('mode', options.mode)
  if (options?.date) query.append('date', options.date)
  const queryString = query.toString() ? `?${query.toString()}` : ''
  return apiClient.delete<HabitActionSuccessResponse>(`/habits/${id}/remove${queryString}`)
}

export const scheduleHabitAction = async (payload: ScheduleHabitPayload): Promise<HabitActionSuccessResponse> => {
  return apiClient.post<HabitActionSuccessResponse>('/habits/schedule-day', payload)
}

export const toggleCheckinAction = async (payload: ToggleCheckinPayload): Promise<ToggleCheckinResponse> => {
  return apiClient.post<ToggleCheckinResponse>('/habits/checkins/toggle', payload)
}

export const getDaySummaryAction = async (date?: string): Promise<DaySummaryResponse> => {
  const queryString = date ? `?date=${encodeURIComponent(date)}` : ''
  return apiClient.get<DaySummaryResponse>(`/habits/day-summary${queryString}`)
}

export const getRangeSummaryAction = async ({ startDate, endDate }: RangeSummaryParams): Promise<DaySummaryResponse[]> => {
  return apiClient.get<DaySummaryResponse[]>(`/habits/range-summary?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`)
}

export const getMonthlyMetricsAction = async (payload?: MonthlyMetricsPayload): Promise<MonthlyMetricsResponse> => {
  return apiClient.post<MonthlyMetricsResponse>('/habits/metrics/monthly', payload || {})
}

const habitsActions = {
  createHabit: createHabitAction,
  listHabits: listHabitsAction,
  updateHabit: updateHabitAction,
  removeHabit: removeHabitAction,
  scheduleHabit: scheduleHabitAction,
  toggleCheckin: toggleCheckinAction,
  getDaySummary: getDaySummaryAction,
  getRangeSummary: getRangeSummaryAction,
  getMonthlyMetrics: getMonthlyMetricsAction
}

export default habitsActions
