import type { RateLimitConfig } from '@middlewares/rateLimit/types'
import type { ActionInput } from '@factories/defineAction/register'

export type DomainModule = {
  rateLimit?: RateLimitConfig
  actions: ActionInput[]
  envVariables: string[]
  name: string
}