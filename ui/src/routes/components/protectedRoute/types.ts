import type { ReactNode } from 'react'

import type { Permission } from '@utils/types/layout'

export interface ProtectedRouteProps {
  children: ReactNode
  requiredPermissions?: Permission[]
}
