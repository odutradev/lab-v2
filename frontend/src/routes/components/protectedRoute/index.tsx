import { Navigate } from 'react-router-dom'

import useAuth from '@hooks/useAuth'

import type { ProtectedRouteProps } from './types'

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
