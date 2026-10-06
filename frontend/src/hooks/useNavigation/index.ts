import { useNavigationStore } from '@stores/navigation'

import type { UseNavigationReturn } from './types'

export const useNavigation = (): UseNavigationReturn => {
  return useNavigationStore()
}

export default useNavigation
