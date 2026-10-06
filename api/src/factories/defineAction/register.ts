import { Router } from 'express'

import { createRateLimiter } from '@middlewares/rateLimit'

import type { ActionDefinition } from '@factories/defineAction/types'
import type { RateLimitConfig } from '@middlewares/rateLimit/types'

export type ActionInput = ActionDefinition | Record<string, ActionDefinition>

const isActionDefinition = (obj: unknown): obj is ActionDefinition => {
  return typeof obj === 'object' && obj !== null && 'method' in obj && 'path' in obj && 'handlers' in obj && Array.isArray((obj as ActionDefinition).handlers)
}

const registerActions = (
  inputs: ActionInput[],
  domainName?: string,
  domainRateLimit?: RateLimitConfig
): Router => {
  const router = Router()

  if (domainName) {
    const domainLimiter = createRateLimiter({
      domainName,
      ...domainRateLimit
    })
    router.use(domainLimiter)
  }

  inputs.forEach((input) => {
    if (isActionDefinition(input)) {
      router[input.method](input.path, ...input.handlers)
      return
    }

    Object.values(input).forEach((action) => {
      if (isActionDefinition(action)) {
        router[action.method](action.path, ...action.handlers)
      }
    })
  })

  return router
}

export default registerActions