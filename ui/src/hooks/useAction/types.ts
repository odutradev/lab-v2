import type { ToastType } from '@stores/toast/types'

export interface ActionToastMessages {
  pending?: string
  success?: string
  successType?: ToastType
  successTitle?: string
  error?: string
  errorTitle?: string
  preferApiErrorMessage?: boolean
}

export interface ActionOptions<T> {
  action: () => Promise<T>
  toastMessages?: ActionToastMessages
  callback?: (result: T) => void
  onError?: (error: unknown) => void
}

export type RunAction = <T>(options: ActionOptions<T>) => Promise<T | undefined>
