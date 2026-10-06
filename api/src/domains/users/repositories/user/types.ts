import type { HydratedDocument, Document } from 'mongoose'

export interface User {
  name: string
  email: string
  password: string
  avatar?: string
  superAdmin: boolean
  emailVerified: boolean
  accountStatus: 'active' | 'blocked'
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
}

export type UpdateUserPayload = Omit<Partial<User>, 'password'>

export interface ListUsersFilters {
  superAdmin?: boolean
  accountStatus?: 'active' | 'blocked'
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
  superAdmins: number
}