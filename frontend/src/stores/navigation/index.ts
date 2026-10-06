import { create } from 'zustand'

import type { NavigationState, AppRoute } from './types'

const getInitialRoute = (): AppRoute => {
  if (typeof window === 'undefined') return 'home'
  const hash = window.location.hash.replace('#', '').replace('/', '')
  if (hash === 'reset-password') return 'reset-password'
  return 'home'
}

export const useNavigationStore = create<NavigationState>((set) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '').replace('/', '')
      const nextRoute: AppRoute = hash === 'reset-password' ? 'reset-password' : 'home'
      set({ currentRoute: nextRoute })
    })
  }

  return {
    currentRoute: getInitialRoute(),
    navigate: (route: AppRoute) => {
      if (typeof window !== 'undefined') {
        window.location.hash = route === 'reset-password' ? '#reset-password' : ''
      }
      set({ currentRoute: route })
    }
  }
})

export default useNavigationStore
