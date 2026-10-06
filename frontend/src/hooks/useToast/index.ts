import { useContext } from 'react'

import ToastContext from '@context/toast/context'

import type { UseToastReturn } from './types'

const useToast = (): UseToastReturn => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export default useToast
