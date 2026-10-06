import { useNavigate, useLocation } from 'react-router-dom'

import type { UseNavigationReturn, AppRoute } from './types'

export const useNavigation = (): UseNavigationReturn => {
  const navigate = useNavigate()
  const location = useLocation()

  const currentRoute: AppRoute = location.pathname.includes('reset-password')
    ? 'reset-password'
    : location.pathname.includes('auth')
      ? 'auth'
      : 'home'

  return {
    currentRoute,
    navigate: (route: AppRoute) => {
      if (route === 'reset-password') {
        navigate('/reset-password')
      } else if (route === 'auth') {
        navigate('/auth')
      } else {
        navigate('/')
      }
    }
  }
}

export default useNavigation
