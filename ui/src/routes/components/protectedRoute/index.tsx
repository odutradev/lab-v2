import { Navigate } from 'react-router-dom'

import useAuthStore from '@stores/auth'

import type { ProtectedRouteProps } from '@routes/components/protectedRoute/types'

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
