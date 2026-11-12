import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { listGoogleCalendarsAction, updateSelectedGoogleCalendarsAction, getGoogleCalendarAuthUrlAction } from '@actions/google/calendar'
import { createRawPersistStorage, readJson, writeJson } from '@utils/functions/storage'
import { storageKeys } from '@assets/config'
import type { CalendarStoreState } from '@stores/calendar/types'

type PersistedCalendarState = Pick<CalendarStoreState, 'selectedCalendarIds'>

const calendarStorage = createRawPersistStorage<PersistedCalendarState>({
  read: () => {
    const storedIds = readJson<unknown>(storageKeys.calendarSelectedIds)
    return { selectedCalendarIds: Array.isArray(storedIds) ? (storedIds as string[]) : [] }
  },
  write: (state) => writeJson(storageKeys.calendarSelectedIds, state.selectedCalendarIds),
  clear: () => localStorage.removeItem(storageKeys.calendarSelectedIds)
})

export const useCalendarStore = create<CalendarStoreState>()(persist((set, get) => ({
  calendars: [],
  selectedCalendarIds: [],
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

      if (Array.isArray(res.selectedCalendarIds) && res.selectedCalendarIds.length > 0) {
        res.selectedCalendarIds.forEach((id) => selected.add(id))
      }

      const selectedList = Array.from(selected)

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
    set({ selectedCalendarIds: ids })
  },

  toggleCalendar: (id: string) => {
    const current = get().selectedCalendarIds
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]

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
}), {
  name: storageKeys.calendarSelectedIds,
  storage: calendarStorage,
  partialize: (state) => ({ selectedCalendarIds: state.selectedCalendarIds })
}))

export default useCalendarStore
