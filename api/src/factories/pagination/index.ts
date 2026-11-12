import type { PaginatedResponse, PaginatedData, PaginationQuery } from './types'

export const getPaginationOptions = (query?: PaginationQuery) => {
  const page = Math.max(1, query?.page ?? 1)
  const limit = Math.max(1, Math.min(100, query?.limit ?? 10))
  const offset = (page - 1) * limit

  return { limit, offset, page }
}

export const paginateList = <T>(rows: T[], query?: PaginationQuery): PaginatedResponse<T> => {
  const hasPagination = query?.page !== undefined || query?.limit !== undefined
  const page = hasPagination ? Math.max(1, query?.page ?? 1) : 1
  const limit = hasPagination ? Math.max(1, Math.min(100, query?.limit ?? 10)) : Math.max(1, rows.length)
  const offset = (page - 1) * limit

  return buildPaginatedResponse({ rows: rows.slice(offset, offset + limit), count: rows.length }, page, limit)
}

export const buildPaginatedResponse = <T>(data: PaginatedData<T>, page: number, limit: number): PaginatedResponse<T> => {
  const totalPages = Math.ceil(data.count / limit)

  return {
    meta: {
      total: data.count,
      totalPages,
      limit,
      page
    },
    data: data.rows
  }
}