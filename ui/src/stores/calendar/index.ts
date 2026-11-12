import { create } from 'zustand'

import {
  listGoogleCalendarsAction,
  updateSelectedGoogleCalendarsAction,
  getGoogleCalendarAuthUrlAction
} from '@actions/google/calendar'
import type { CalendarStoreState } from './types'

const CALENDAR_STORAGE_KEY = 'lab_calendar_selected_ids_v1'

const loadInitialSelectedIds = (): string[] => {
  try {
    const raw = localStorage.getItem(CALENDAR_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch {
    // ignorar falha ao ler localstorage
  }
  return []
}

export const useCalendarStore = create<CalendarStoreState>((set, get) => ({
  calendars: [],
  selectedCalendarIds: loadInitialSelectedIds(),
  isConnected: false,
  isLoading: false,
  isSaving: false,
  isConnecting: false,

  fetchCalendars: async () => {
    set({ isLoading: true })
    try {
      const res = await listGoogleCalendarsAction()
      const selected = new Set<string>()

      res.items.forEach((item) => {
        if (item.selected) {
          selected.add(item.id)
        }
      })

      // Se a resposta trouxe selectedCalendarIds explícitos da API
      if (Array.isArray(res.selectedCalendarIds) && res.selectedCalendarIds.length > 0) {
        res.selectedCalendarIds.forEach((id) => selected.add(id))
      }

      const selectedList = Array.from(selected)
      try {
        localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(selectedList))
      } catch {
        // ignorar
      }

      set({
        isConnected: res.connected,
        calendars: res.items,
        selectedCalendarIds: selectedList,
        isLoading: false
      })
    } catch (err) {
      console.error('Failed to fetch google calendars', err)
      set({ isLoading: false })
      throw err
    }
  },

  setSelectedCalendarIds: (ids: string[]) => {
    try {
      localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(ids))
    } catch {
      // ignorar
    }
    set({ selectedCalendarIds: ids })
  },

  toggleCalendar: (id: string) => {
    const current = get().selectedCalendarIds
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]

    try {
      localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignorar
    }

    set({ selectedCalendarIds: next })
  },

  saveSelectedCalendars: async () => {
    const { selectedCalendarIds, calendars } = get()
    set({ isSaving: true })
    try {
      const res = await updateSelectedGoogleCalendarsAction({
        calendarIds: selectedCalendarIds
      })

      const updatedIds = res.selectedCalendarIds || selectedCalendarIds
      try {
        localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(updatedIds))
      } catch {
        // ignorar
      }

      const updatedCalendars = calendars.map((cal) => ({
        ...cal,
        selected: updatedIds.includes(cal.id)
      }))

      set({
        selectedCalendarIds: updatedIds,
        calendars: updatedCalendars,
        isSaving: false
      })
    } catch (err) {
      set({ isSaving: false })
      throw err
    }
  },

  connectGoogle: async () => {
    set({ isConnecting: true })
    try {
      const { url } = await getGoogleCalendarAuthUrlAction()
      window.location.href = url
    } catch (err) {
      set({ isConnecting: false })
      throw err
    }
  }
}))

export default useCalendarStore
