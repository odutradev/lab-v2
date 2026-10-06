import { Navigate } from 'react-router-dom'

import useAuth from '@hooks/useAuth'

import type { PublicRouteProps } from './types'

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default PublicRoute
