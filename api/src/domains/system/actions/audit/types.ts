import type { logResponseSchema, logsQuerySchema, logIdParamsSchema, paginatedLogsSchema } from '@domains/system/actions/audit/schemas'
import type { z } from 'zod'

export type LogsQuery = z.infer<typeof logsQuerySchema>
export type LogIdParams = z.infer<typeof logIdParamsSchema>
export type LogResponse = z.infer<typeof logResponseSchema>
export type ListLogsResponse = z.infer<typeof paginatedLogsSchema>

export interface ListLogsRequest {
  query: LogsQuery
}

export interface GetLogByIdRequest {
  params: LogIdParams
}