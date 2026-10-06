import { z } from 'zod'

import type { RouteSchema } from '@middlewares/manageRequest/types'
import type { Request } from 'express'

export type ValidationResult = {
  success: true
  data: {
    params: unknown
    query: unknown
    body: unknown
  }
} | {
  success: false
  error: z.ZodError
  details: Array<{ field: string; message: string }>
}

const formatZodError = (error: z.ZodError) => {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message
  }))
}

export const validateRequest = (req: Request, schema: RouteSchema): ValidationResult => {
  const payload = {
    params: req.params,
    query: req.query,
    body: req.body
  }
  if (schema.params) {
    const result = schema.params.safeParse(payload.params)
    if (!result.success) {
      return {
        success: false,
        error: result.error,
        details: formatZodError(result.error)
      }
    }
    Object.defineProperty(req, 'params', {
      value: result.data,
      writable: true,
      configurable: true,
      enumerable: true
    })
  }
  if (schema.query) {
    const result = schema.query.safeParse(payload.query)
    if (!result.success) {
      return {
        success: false,
        error: result.error,
        details: formatZodError(result.error)
      }
    }
    Object.defineProperty(req, 'query', {
      value: result.data,
      writable: true,
      configurable: true,
      enumerable: true
    })
  }
  if (schema.body) {
    const result = schema.body.safeParse(payload.body)
    if (!result.success) {
      return {
        success: false,
        error: result.error,
        details: formatZodError(result.error)
      }
    }
    req.body = result.data
  }
  return {
    success: true,
    data: {
      params: req.params,
      query: req.query,
      body: req.body
    }
  }
}