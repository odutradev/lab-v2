import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import { createPaginatedSchema, paginationQuerySchema } from '@factories/pagination/schemas'
import { createFilterQuerySchema } from '@factories/filters/schemas'

extendZodWithOpenApi(z)

export const logResponseSchema = z.object({
  _id: z.unknown(),
  actorId: z.string(),
  action: z.string(),
  entity: z.string(),
  summary: z.string().optional(),
  entityId: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.unknown()
})

export const logsQuerySchema = paginationQuerySchema.merge(
  createFilterQuerySchema({ exact: ['action', 'entity', 'actorId'] })
)

export const logIdParamsSchema = z.object({
  id: z.string()
})

export const paginatedLogsSchema = createPaginatedSchema(logResponseSchema, 'PaginatedLogs')