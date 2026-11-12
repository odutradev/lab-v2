import { createRateLimiter } from '@middlewares/rateLimit'
import manageRequest from '@middlewares/manageRequest'
import { registerOpenApiAction } from './openapi'

import type { ManageRequestSchema, ServiceFunction } from '@middlewares/manageRequest/types'
import type { ActionMetadata, ActionDefinition } from './types'

const defineAction = <T extends ManageRequestSchema = ManageRequestSchema>(
  metadata: ActionMetadata,
  service: ServiceFunction<T>
): ActionDefinition => {
  registerOpenApiAction(metadata)

  const handler = manageRequest(service, metadata.schema)
  const actionMiddlewares = metadata.middlewares ? [...metadata.middlewares] : []
  const rateLimitOptions = typeof metadata.rateLimit === 'object' ? metadata.rateLimit : {}
  const rateLimiters = metadata.rateLimit ? [createRateLimiter({ endpointPath: metadata.path, ...rateLimitOptions })] : []

  const handlers = [...rateLimiters, ...actionMiddlewares, handler]

  return {
    method: metadata.method,
    path: metadata.path,
    handlers
  }
}

export default defineAction