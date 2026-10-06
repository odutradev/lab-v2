import type { HydratedDocument, Document } from 'mongoose'

export interface BankDetails {
  bankName: string
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'
  pixKey: string
  accountHolder: string
}

export interface AcademicData {
  institution: string
  course: string
  degreeLevel: 'undergraduate' | 'master' | 'doctorate'
  courseStart: string
  courseEnd: string
  enrollmentId: string
}

export interface DocumentItem {
  reference: string
  sentAt: Date
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: {
    id: string
    name: string
  }
  documentType?: string
  resubmitCount: number
  updatedAt: Date
}

export interface ContractItem {
  reference: string
  sentAt: Date
  updatedAt: Date
}

export interface TenantProfileDocuments {
  status: 'not_submitted' | 'incomplete_documentation' | 'pending' | 'approved' | 'rejected'
  identityFront?: DocumentItem
  identityBack?: DocumentItem
  selfie?: DocumentItem
  enrollmentProof?: DocumentItem
}

export interface OwnerProfileDocuments {
  status: 'not_submitted' | 'incomplete_documentation' | 'pending' | 'approved' | 'rejected'
  identityFront?: DocumentItem
  identityBack?: DocumentItem
  selfie?: DocumentItem
  residencyProof?: DocumentItem
  contract?: ContractItem
}

export interface UserDocuments {
  tenant?: TenantProfileDocuments
  owner?: OwnerProfileDocuments
}

export interface User {
  name: string
  email: string
  password: string
  avatar?: string
  superAdmin: boolean
  isEmailVerified: boolean
  isTenant: boolean
  isOwner: boolean
  document: string
  birthDate: string
  phone: string
  referralSource: string
  accountStatus: 'active' | 'blocked'
  academicData?: AcademicData
  ownerType?: 'individual' | 'legal_entity'
  documents?: UserDocuments
  bankDetails?: BankDetails
}

export interface UserDocument extends User, Document {
  createdAt: Date
  updatedAt: Date
}

export type UserModelType = HydratedDocument<UserDocument>
export type UserModelTypeWithPassword = HydratedDocument<UserDocument>

export type CreateUserPayload = {
  name: string
  email: string
  passwordHash: string
  isTenant: boolean
  isOwner: boolean
  document: string
  birthDate: string
  phone: string
  referralSource: string
  academicData?: AcademicData
}

export type UpdateUserPayload = Omit<Partial<User>, 'password'>

export interface AccountReadiness {
  isReady: boolean
  issues: string[]
}

export interface ListUsersFilters {
  role?: 'tenant' | 'owner' | 'superAdmin'
  accountStatus?: 'active' | 'blocked'
  isEmailVerified?: boolean
  tenantDocumentStatus?: 'not_submitted' | 'incomplete_documentation' | 'pending' | 'approved' | 'rejected'
  ownerDocumentStatus?: 'not_submitted' | 'incomplete_documentation' | 'pending' | 'approved' | 'rejected'
}

export interface FindAllUsersParams {
  limit: number
  offset: number
  search?: string
  filters?: ListUsersFilters
  sort?: Record<string, 1 | -1>
}

export interface UserStatsResponse {
  total: number
  active: number
  blocked: number
  tenants: number
  owners: number
  superAdmins: number
  pendingTenantVerifications: number
  pendingOwnerVerifications: number
}