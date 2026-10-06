export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastMessage {
  id: string
  type: ToastType
  title?: string
  message: string
}

export interface ToastState {
  toasts: ToastMessage[]
  showToast: (message: string, type?: ToastType, title?: string) => void
  removeToast: (id: string) => void
}
