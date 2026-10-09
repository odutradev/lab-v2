import type { GoogleCalendarStatusResponse } from '@actions/google/calendar/types'

export interface ProfileSecurityCardProps {
  onNavigateResetPassword: () => void
  calendarStatus?: GoogleCalendarStatusResponse
  isCalendarLoading?: boolean
  isConnectingCalendar?: boolean
  isDisconnectingCalendar?: boolean
  isSavingCalendarName?: boolean
  isRecreatingCalendar?: boolean
  isDisconnectModalOpen: boolean
  isEditCalendarNameModalOpen: boolean
  calendarNameInput: string
  onCalendarNameInputChange: (value: string) => void
  onConnectCalendar?: () => void
  onOpenDisconnectModal: () => void
  onCloseDisconnectModal: () => void
  onConfirmDisconnect: (deleteCalendar: boolean) => void
  onOpenEditCalendarNameModal: () => void
  onCloseEditCalendarNameModal: () => void
  onSaveCalendarName: () => void
  onRecreateCalendar?: () => void
}
