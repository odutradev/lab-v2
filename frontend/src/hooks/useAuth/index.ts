import { useAuthStore } from '@stores/auth'

import type { UseAuthReturn } from './types'

export const useAuth = (): UseAuthReturn => {
  return useAuthStore()
}

export default useAuth
