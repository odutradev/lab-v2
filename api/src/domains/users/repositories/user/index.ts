import { UserModel } from '@domains/users/repositories/user/model'

import type { UserModelTypeWithPassword, CreateUserPayload, UpdateUserPayload, UserModelType, FindAllUsersParams, UserStatsResponse, UserBodyMetrics } from '@domains/users/repositories/user/types'
import type { PaginatedData } from '@factories/pagination/types'

const userRepository = {
  create: async (payload: CreateUserPayload): Promise<UserModelType> => {
    return UserModel.create({
      name: payload.name,
      email: payload.email,
      password: payload.passwordHash
    })
  },
  update: async (id: string, payload: UpdateUserPayload): Promise<UserModelType | null> => {
    const updateQuery = Object.entries(payload).reduce<Record<string, unknown>>((query, [key, value]) => {
      const isHealthObject = key === 'health' && value && typeof value === 'object' && !Array.isArray(value)
      if (!isHealthObject) return { ...query, [key]: value }
      const healthEntries = Object.entries(value).map(([healthKey, healthValue]) => [`health.${healthKey}`, healthValue])
      return { ...query, ...Object.fromEntries(healthEntries) }
    }, {})
    return UserModel.findByIdAndUpdate(id, { $set: updateQuery }, { new: true })
  },
  findBodyMetrics: async (id: string): Promise<UserBodyMetrics | null> => {
    const user = await UserModel.findById(id).select('health.height health.age health.weightHistory').lean()
    if (!user) return null
    const weightHistory = [...(user.health?.weightHistory || [])].sort((first, second) => first.date.localeCompare(second.date))
    return {
      weight: weightHistory.at(-1)?.weight,
      height: user.health?.height,
      age: user.health?.age,
      weightHistory
    }
  },
  updatePassword: async (id: string, password: string): Promise<UserModelType | null> => {
    return UserModel.findByIdAndUpdate(id, { password }, { new: true })
  },
  updateAccountStatus: async (id: string, status: 'active' | 'blocked'): Promise<UserModelType | null> => {
    return UserModel.findByIdAndUpdate(id, { accountStatus: status }, { new: true })
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
        { email: searchRegex }
      ]
    }

    if (filters) {
      if (typeof filters.superAdmin === 'boolean') query.superAdmin = filters.superAdmin
      if (filters.accountStatus) query.accountStatus = filters.accountStatus
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
  promoteSuperAdminByEmail: async (email: string): Promise<UserModelType | null> => {
    return UserModel.findOneAndUpdate(
      { email: { $regex: new RegExp(`^${email}$`, 'i') } },
      { superAdmin: true },
      { new: true }
    )
  },
  updateSuperAdmin: async (id: string, superAdmin: boolean): Promise<UserModelType | null> => {
    return UserModel.findByIdAndUpdate(id, { superAdmin }, { new: true })
  },
  updateEmailVerified: async (id: string, emailVerified = true): Promise<UserModelType | null> => {
    return UserModel.findByIdAndUpdate(id, { emailVerified }, { new: true })
  },
  updateGoogleCalendarIntegration: async (
    id: string,
    data: {
      connected: boolean
      email?: string
      refreshToken?: string
      calendarId?: string
      calendarName?: string
      connectedAt?: Date
    }
  ): Promise<UserModelType | null> => {
    return UserModel.findByIdAndUpdate(
      id,
      {
        $set: {
          'integrations.googleCalendar': data
        }
      },
      { new: true }
    )
  },
  updateGoogleCalendarName: async (id: string, calendarName: string): Promise<UserModelType | null> => {
    return UserModel.findByIdAndUpdate(
      id,
      {
        $set: {
          'integrations.googleCalendar.calendarName': calendarName
        }
      },
      { new: true }
    )
  },
  updateGoogleCalendarSelectedIds: async (id: string, selectedCalendarIds: string[]): Promise<UserModelType | null> => {
    return UserModel.findByIdAndUpdate(
      id,
      {
        $set: {
          'integrations.googleCalendar.selectedCalendarIds': selectedCalendarIds
        }
      },
      { new: true }
    )
  },
  findWithGoogleCalendarRefreshToken: async (id: string): Promise<UserModelType | null> => {
    const user = await UserModel.findById(id).select('+integrations.googleCalendar.refreshToken').lean()
    if (!user) return null
    return { ...user, id: user._id.toString() } as unknown as UserModelType
  }
}

export default userRepository