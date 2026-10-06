import { UserModel } from '@domains/users/repositories/user/model'

import type { UserModelTypeWithPassword, CreateUserPayload, UpdateUserPayload, UserModelType, BankDetails, FindAllUsersParams, UserStatsResponse } from '@domains/users/repositories/user/types'
import type { PaginatedData } from '@factories/pagination/types'

const userRepository = {
  create: async (payload: CreateUserPayload): Promise<UserModelType> => {
    return UserModel.create({
      name: payload.name,
      email: payload.email,
      password: payload.passwordHash,
      birthDate: payload.birthDate,
      phone: payload.phone,
      referralSource: payload.referralSource
    })
  },
  update: async (id: string, payload: UpdateUserPayload): Promise<UserModelType | null> => {
    return UserModel.findByIdAndUpdate(id, payload, { new: true })
  },
  updatePassword: async (id: string, password: string): Promise<UserModelType | null> => {
    return UserModel.findByIdAndUpdate(id, { password }, { new: true })
  },
  updateAccountStatus: async (id: string, status: 'active' | 'blocked'): Promise<UserModelType | null> => {
    return UserModel.findByIdAndUpdate(id, { accountStatus: status }, { new: true })
  },
  updateBankDetails: async (id: string, bankDetails: BankDetails): Promise<UserModelType | null> => {
    return UserModel.findByIdAndUpdate(id, { bankDetails }, { new: true })
  },
  findByEmail: async (email: string, select?: string): Promise<UserModelType | null> => {
    const query = UserModel.findOne({ email })
    if (select) query.select(select)
    const user = await query.lean()
    if (!user) return null
    return { ...user, id: user._id.toString() } as unknown as UserModelType
  },
  findByEmailWithPassword: async (email: string): Promise<UserModelTypeWithPassword | null> => {
    const user = await UserModel.findOne({ email }).select('+password').lean()
    if (!user) return null
    return { ...user, id: user._id.toString() } as unknown as UserModelTypeWithPassword
  },
  findById: async (id: string, select?: string): Promise<UserModelType | null> => {
    const query = UserModel.findById(id)
    if (select) query.select(select)
    const user = await query.lean()
    if (!user) return null
    return { ...user, id: user._id.toString() } as unknown as UserModelType
  },
  findAll: async ({ limit, offset, search, filters, sort }: FindAllUsersParams): Promise<PaginatedData<UserModelType>> => {
    const query: Record<string, unknown> = {}

    if (search) {
      const cleanSearch = search.trim()
      const searchRegex = new RegExp(cleanSearch, 'i')
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ]
    }

    if (filters) {
      if (typeof filters.superAdmin === 'boolean') query.superAdmin = filters.superAdmin
      if (filters.accountStatus) query.accountStatus = filters.accountStatus
      if (typeof filters.isEmailVerified === 'boolean') query.isEmailVerified = filters.isEmailVerified
    }

    const sortOption = sort || { createdAt: -1 }

    const [count, rows] = await Promise.all([
      UserModel.countDocuments(query),
      UserModel.find(query).sort(sortOption).skip(offset).limit(limit).lean()
    ])

    const formattedRows = rows.map((u) => ({
      ...u,
      id: u._id.toString()
    })) as unknown as UserModelType[]

    return { count, rows: formattedRows }
  },
  getStats: async (): Promise<UserStatsResponse> => {
    const [
      total,
      active,
      blocked,
      superAdmins
    ] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ accountStatus: 'active' }),
      UserModel.countDocuments({ accountStatus: 'blocked' }),
      UserModel.countDocuments({ superAdmin: true })
    ])

    return {
      total,
      active,
      blocked,
      superAdmins
    }
  },
  updateSuperAdmin: async (id: string, superAdmin: boolean): Promise<UserModelType | null> => {
    return UserModel.findByIdAndUpdate(id, { superAdmin }, { new: true })
  }
}

export default userRepository