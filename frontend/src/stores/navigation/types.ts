export type AppRoute = 'home' | 'auth' | 'reset-password'

export interface NavigationState {
  currentRoute: AppRoute
  navigate: (route: AppRoute) => void
}
