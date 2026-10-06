import type { RateLimitConfig } from '@middlewares/rateLimit/types'
import type { RouteSchema } from '@middlewares/manageRequest/types'
import type { ZodRequestBody } from '@asteasolutions/zod-to-openapi'
import type { RequestHandler } from 'express'

export type ResponseConfig = {
  description: string
  schema?: unknown
}

export type ActionMetadata = {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch'
  rateLimit?: boolean | RateLimitConfig
  authenticate?: boolean
  permissions?: string[]
  path: string
  summary: string
  tags: string[]
  security?: Array<Record<string, string[]>>
  responses?: Record<string, ResponseConfig>
  middlewares?: RequestHandler[]
  requestBody?: ZodRequestBody
  requestFormat?: 'json' | 'multipart'
  uploadFieldName?: string
  schema?: RouteSchema
}

export type ActionDefinition = {
  method: ActionMetadata['method']
  path: string
  handlers: RequestHandler[]
}