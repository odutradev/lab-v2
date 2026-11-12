import type { Permission } from '@utils/types/layout'

export interface SystemState {
  getPermissions: () => Permission[]
  hasPermissions: (requiredPermissions?: Permission[]) => boolean
}
