import type { ResponseErrorsParams } from '@factories/errors/types'
import type { Request, Response } from 'express'
import type { ZodObject, ZodRawShape } from 'zod'

export type FileData = {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  size: number
  destination?: string
  filename?: string
  path?: string
  buffer?: Buffer
}

export type ManageRequestResponse<T = unknown> = Promise<T | void | 'error'>

export type ManageRequestSchema = {
  params?: unknown
  query?: unknown
  body?: unknown
}

export type ManageErrorParams = {
  code: ResponseErrorsParams
  error?: unknown
  details?: unknown
}

export type DefaultExpressContext = {
  res: Response
  req: Request
}

export type RequestIdentifiers = {
  userId?: string
}

export type RouteSchema = {
  params?: ZodObject<ZodRawShape>
  query?: ZodObject<ZodRawShape>
  body?: ZodObject<ZodRawShape>
}

export type ManageRequestBody<T extends ManageRequestSchema = ManageRequestSchema> = {
  manageError: (data: ManageErrorParams) => void
  defaultExpress: DefaultExpressContext
  ids: RequestIdentifiers
  params: T['params']
  query: T['query']
  data: T['body']
  file?: FileData
}

export type ServiceFunction<T extends ManageRequestSchema = ManageRequestSchema> = (
  requestBody: ManageRequestBody<T>
) => ManageRequestResponse | unknown