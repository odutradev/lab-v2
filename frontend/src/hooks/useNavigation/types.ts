import type { AppRoute } from '@stores/navigation/types'

export interface UseNavigationReturn {
  currentRoute: AppRoute
  navigate: (route: AppRoute) => void
}
