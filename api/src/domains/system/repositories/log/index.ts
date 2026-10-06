import { LogModel } from '@domains/system/repositories/log/model'

import type { CreateLogPayload, LogModelType, FindAllLogsFilters } from '@domains/system/repositories/log/types'
import type { PaginatedData } from '@factories/pagination/types'

const logRepository = {
  create: async (payload: CreateLogPayload): Promise<LogModelType> => {
    return await LogModel.create(payload)
  },
  findById: async (id: string, select?: string): Promise<LogModelType | null> => {
    const query = LogModel.findById(id)
    if (select) query.select(select)
    const log = await query.lean()
    if (!log) return null
    return { ...log, id: log._id.toString() } as unknown as LogModelType
  },
  findAll: async ({ limit = 10, offset = 0, filters, actorId }: FindAllLogsFilters): Promise<PaginatedData<LogModelType>> => {
    const query = LogModel.find()

    if (actorId) query.where('actorId').equals(actorId)
    if (filters?.actorId) query.where('actorId').equals(filters.actorId)
    if (filters?.action) query.where('action').equals(filters.action)
    if (filters?.entity) query.where('entity').equals(filters.entity)

    const [rows, count] = await Promise.all([
      query.sort({ createdAt: -1 }).skip(offset).limit(limit).lean().exec() as unknown as Promise<LogModelType[]>,
      LogModel.countDocuments(query.getQuery())
    ])

    return { rows, count }
  }
}

export default logRepository