export type AccountType = 'tenant' | 'owner'

export interface UserAcademicData {
  institution?: string
  course?: string
  registrationNumber?: string
  expectedGraduation?: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  isTenant: boolean
  isOwner: boolean
  document?: string
  birthDate?: string
  phone?: string
  referralSource?: string
  avatarUrl?: string
  academicData?: UserAcademicData
  createdAt?: string
  updatedAt?: string
}

export interface AuthTokens {
  token: string
  refreshToken: string
}
