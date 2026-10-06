import { useToastStore } from '@stores/toast'

import type { UseToastReturn } from './types'

export const useToast = (): UseToastReturn => {
  return useToastStore()
}

export default useToast
