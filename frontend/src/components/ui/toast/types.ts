import type { ToastMessage } from '../../../context/toast/types'

export interface ToastItemProps {
  toast: ToastMessage
  onClose: (id: string) => void
}
