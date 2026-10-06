import apiClient from '@api/client'

import type { HabitActionSuccessResponse, ToggleCheckinResponse, ScheduleHabitPayload, ToggleCheckinPayload, CreateHabitPayload, UpdateHabitPayload, DaySummaryResponse, ListHabitsParams, Habit } from './types'

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

export const removeHabitAction = async (id: string): Promise<HabitActionSuccessResponse> => {
  return apiClient.delete<HabitActionSuccessResponse>(`/habits/${id}/remove`)
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

const habitsActions = {
  createHabit: createHabitAction,
  listHabits: listHabitsAction,
  updateHabit: updateHabitAction,
  removeHabit: removeHabitAction,
  scheduleHabit: scheduleHabitAction,
  toggleCheckin: toggleCheckinAction,
  getDaySummary: getDaySummaryAction
}

export default habitsActions
