import type { Request } from 'express'

export type RateLimitConfig = {
  keyGenerator?: (req: Request) => string
  windowMs?: number
  message?: string
  max?: number
}

export type CreateRateLimiterOptions = RateLimitConfig & {
  endpointPath?: string
  domainName?: string
}
