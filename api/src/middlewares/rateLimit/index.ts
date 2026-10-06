import rateLimit from 'express-rate-limit'

import { defaultRateLimitConfig } from '@config/rateLimit'
import sendError from '@factories/errors'

import type { RequestHandler, Response, Request } from 'express'
import type { CreateRateLimiterOptions } from './types'

export const createRateLimiter = (options: CreateRateLimiterOptions = {}): RequestHandler => {
  const windowMs = options.windowMs ?? defaultRateLimitConfig.windowMs
  const max = options.max ?? defaultRateLimitConfig.max

  return rateLimit({
    windowMs,
    limit: max,
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    skip: (req: Request): boolean => req.method === 'OPTIONS',
    keyGenerator: (req: Request): string => {
      if (options.keyGenerator) {
        return options.keyGenerator(req)
      }
      if (options.domainName) {
        return `${req.ip}:${options.domainName}`
      }
      if (options.endpointPath) {
        return `${req.ip}:${req.method}:${options.endpointPath}`
      }
      return `${req.ip}:${req.originalUrl}`
    },
    handler: (req: Request, res: Response): void => {
      sendError({ code: 'too_many_requests', res, local: 'rate-limit' })
    }
  })
}

export default createRateLimiter
