import { useCallback } from 'react'

import useToastStore from '@stores/toast'

import type { ApiError } from '@utils/types/api'
import type { ActionOptions, RunAction } from './types'

const resolveErrorMessage = (error: unknown, fallback: string, preferApiErrorMessage?: boolean): string => {
  if (!preferApiErrorMessage) return fallback
  return (error as ApiError)?.message || fallback
}

// Executa uma action assíncrona exibindo toasts de pendente, sucesso e erro,
// e chama o callback ao final quando a action termina com sucesso.
const useAction = (): RunAction => {
  const showToast = useToastStore((state) => state.showToast)

  return useCallback(
    async <T,>({ action, toastMessages, callback, onError }: ActionOptions<T>): Promise<T | undefined> => {
      if (toastMessages?.pending) showToast(toastMessages.pending, 'info')

      try {
        const result = await action()

        if (toastMessages?.success) {
          showToast(toastMessages.success, toastMessages.successType ?? 'success', toastMessages.successTitle)
        }

        callback?.(result)
        return result
      } catch (error) {
        if (toastMessages?.error) {
          showToast(resolveErrorMessage(error, toastMessages.error, toastMessages.preferApiErrorMessage), 'error', toastMessages.errorTitle)
        }

        onError?.(error)
        return undefined
      }
    },
    [showToast]
  )
}

export default useAction
