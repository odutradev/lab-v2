export type Permission = 'super_admin'

export interface PageMetadata {
  isPrivate?: boolean
  isPublicOnly?: boolean
  isCentered?: boolean
  requiredPermissions?: Permission[]
}
