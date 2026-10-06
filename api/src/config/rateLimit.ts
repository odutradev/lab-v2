export const defaultRateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  max: 100
} as const

export const sensitiveEndpointRateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  max: 5
} as const
