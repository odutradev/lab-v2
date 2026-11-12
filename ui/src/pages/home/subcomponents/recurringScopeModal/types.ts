import type { RecurrenceScopeMode } from '@actions/habits/types'

export type RecurringActionType = 'delete' | 'edit'

export interface RecurringScopeModalProps {
  isOpen: boolean
  actionType: RecurringActionType
  onClose: () => void
  onConfirm: (mode: RecurrenceScopeMode) => void
  isLoading?: boolean
}
