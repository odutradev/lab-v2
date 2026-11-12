import api from '@utils/api'

import type { RemoveHabitOptions, HabitActionSuccessResponse, ToggleCheckinResponse, ScheduleHabitPayload, ToggleCheckinPayload, RangeSummaryParams, CreateHabitPayload, UpdateHabitPayload, DaySummaryResponse, ListHabitsParams, Habit, MonthlyMetricsPayload, MonthlyMetricsResponse } from '@actions/habits/types'
import type { PaginatedResponse } from '@utils/types/api'

export const createHabitAction = async (payload: CreateHabitPayload): Promise<Habit> => {
  const response = await api.post<Habit>('/habits/create', payload)
  return response.data
}

export const listHabitsAction = async (params?: ListHabitsParams): Promise<Habit[]> => {
  const query = {
    frequency: params?.frequency || undefined,
    active: typeof params?.active === 'boolean' ? String(params.active) : undefined
  }
  const response = await api.get<PaginatedResponse<Habit>>('/habits/list', { params: query })
  return response.data.data
}

export const updateHabitAction = async (id: string, payload: UpdateHabitPayload): Promise<Habit> => {
  const response = await api.patch<Habit>(`/habits/${id}/update`, payload)
  return response.data
}

export const removeHabitAction = async (id: string, options?: RemoveHabitOptions): Promise<HabitActionSuccessResponse> => {
  const query = { mode: options?.mode || undefined, date: options?.date || undefined }
  const response = await api.delete<HabitActionSuccessResponse>(`/habits/${id}/remove`, { params: query })
  return response.data
}

export const scheduleHabitAction = async (payload: ScheduleHabitPayload): Promise<HabitActionSuccessResponse> => {
  const response = await api.post<HabitActionSuccessResponse>('/habits/schedule-day', payload)
  return response.data
}

export const toggleCheckinAction = async (payload: ToggleCheckinPayload): Promise<ToggleCheckinResponse> => {
  const response = await api.post<ToggleCheckinResponse>('/habits/checkins/toggle', payload)
  return response.data
}

export const getDaySummaryAction = async (date?: string): Promise<DaySummaryResponse> => {
  const response = await api.get<DaySummaryResponse>('/habits/day-summary', { params: { date: date || undefined } })
  return response.data
}

export const getRangeSummaryAction = async ({ startDate, endDate }: RangeSummaryParams): Promise<DaySummaryResponse[]> => {
  const response = await api.get<DaySummaryResponse[]>('/habits/range-summary', { params: { startDate, endDate } })
  return response.data
}

export const getMonthlyMetricsAction = async (payload?: MonthlyMetricsPayload): Promise<MonthlyMetricsResponse> => {
  const response = await api.post<MonthlyMetricsResponse>('/habits/metrics/monthly', payload || {})
  return response.data
}
