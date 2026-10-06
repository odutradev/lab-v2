export type AppRoute = 'home' | 'auth' | 'reset-password'

export interface UseNavigationReturn {
  currentRoute: AppRoute
  navigate: (route: AppRoute) => void
}
