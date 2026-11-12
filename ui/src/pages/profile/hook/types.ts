import type { UserProfile } from '@projectTypes/user'
import type { GoogleCalendarStatusResponse } from '@actions/google/calendar/types'

export interface UseProfileReturn {
  user: UserProfile | null
  initials: string
  calendarStatus: GoogleCalendarStatusResponse
  isCalendarLoading: boolean
  isConnectingCalendar: boolean
  isDisconnectingCalendar: boolean
  isSavingCalendarName: boolean
  isRecreatingCalendar: boolean
  isDisconnectModalOpen: boolean
  isEditCalendarNameModalOpen: boolean
  calendarNameInput: string
  setCalendarNameInput: (value: string) => void
  openDisconnectModal: () => void
  closeDisconnectModal: () => void
  handleConfirmDisconnect: (deleteCalendar: boolean) => Promise<void>
  openEditCalendarNameModal: () => void
  closeEditCalendarNameModal: () => void
  handleSaveCalendarName: () => Promise<void>
  handleRecreateCalendar: () => Promise<void>
  handleConnectGoogleCalendar: () => Promise<void>
  handleNavigateResetPassword: () => void
  handleNavigateHome: () => void
  isClearCacheModalOpen: boolean
  isClearingCache: boolean
  openClearCacheModal: () => void
  closeClearCacheModal: () => void
  handleClearCache: () => Promise<void>
  formatDate: (dateStr?: string) => string
}
