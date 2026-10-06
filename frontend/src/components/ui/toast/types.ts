import type { ToastMessage } from '@stores/toast/types'

export interface ToastItemProps {
  toast: ToastMessage
  onClose: (id: string) => void
}
