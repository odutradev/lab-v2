import { paginatedLogsSchema, logsQuerySchema, logIdParamsSchema, logResponseSchema } from '@domains/system/actions/audit/schemas'
import { getPaginationOptions, buildPaginatedResponse } from '@factories/pagination'
import superAdminMiddleware from '@domains/users/middlewares/superAdmin'
import userRepository from '@domains/users/repositories/user'
import logRepository from '@domains/system/repositories/log'
import authMiddleware from '@domains/users/middlewares/auth'
import defineAction from '@factories/defineAction'

import type { ListLogsRequest, ListLogsResponse, GetLogByIdRequest, LogResponse } from '@domains/system/actions/audit/types'
import type { ManageRequestResponse, ManageRequestBody } from '@middlewares/manageRequest/types'

export const listProfileLogs = defineAction(
  {
    method: 'get',
    path: '/audit/profile/logs',
    summary: 'Lista logs de auditoria do próprio usuário',
    tags: ['Audit'],
    schema: { query: logsQuerySchema },
    responses: {
      200: { description: 'Logs listados com sucesso', schema: paginatedLogsSchema }
    },
    middlewares: [authMiddleware]
  },
  async ({ ids, query, manageError }: ManageRequestBody<ListLogsRequest>): ManageRequestResponse<ListLogsResponse> => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { limit, offset, page } = getPaginationOptions(query)
    const rawFilters = query?.filters as Record<string, string> | undefined
    const filters = rawFilters ? { ...rawFilters } : undefined

    if (filters) delete filters.actorId

    const result = await logRepository.findAll({ limit, offset, filters, actorId: ids.userId })

    return buildPaginatedResponse({ rows: result.rows, count: result.count }, page, limit)
  }
)

export const listAdminLogs = defineAction(
  {
    method: 'get',
    path: '/audit/logs',
    summary: 'Lista logs de auditoria do sistema (Admin)',
    tags: ['Audit'],
    schema: { query: logsQuerySchema },
    responses: {
      200: { description: 'Logs listados com sucesso', schema: paginatedLogsSchema }
    },
    middlewares: [authMiddleware, superAdminMiddleware]
  },
  async ({ ids, query, manageError }: ManageRequestBody<ListLogsRequest>): ManageRequestResponse<ListLogsResponse> => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { limit, offset, page } = getPaginationOptions(query)
    const filters = query?.filters as Record<string, string> | undefined

    const result = await logRepository.findAll({ limit, offset, filters })

    return buildPaginatedResponse({ rows: result.rows, count: result.count }, page, limit)
  }
)

export const getLogById = defineAction(
  {
    method: 'get',
    path: '/audit/logs/:id/details',
    summary: 'Busca um log de auditoria pelo id',
    tags: ['Audit'],
    schema: { params: logIdParamsSchema },
    responses: {
      200: { description: 'Log encontrado com sucesso', schema: logResponseSchema },
      403: { description: 'Log pertence a outro usuário' },
      404: { description: 'Log não encontrado' }
    },
    middlewares: [authMiddleware]
  },
  async ({ ids, params, manageError }: ManageRequestBody<GetLogByIdRequest>): ManageRequestResponse<LogResponse> => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const log = await logRepository.findById(params.id)
    if (!log) return manageError({ code: 'not_found' })

    const user = await userRepository.findById(ids.userId)
    const isAdmin = Boolean(user?.superAdmin)

    if (!isAdmin && log.actorId !== ids.userId) return manageError({ code: 'forbidden' })

    return log
  }
)