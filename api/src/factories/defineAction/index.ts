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
  let actionMiddlewares = metadata.middlewares ? [...metadata.middlewares] : []

  if (metadata.rateLimit) {
    const rateLimitOptions = typeof metadata.rateLimit === 'object' ? metadata.rateLimit : {}
    const endpointRateLimiter = createRateLimiter({
      endpointPath: metadata.path,
      ...rateLimitOptions
    })
    actionMiddlewares = [endpointRateLimiter, ...actionMiddlewares]
  }

  const handlers = [...actionMiddlewares, handler]

  return {
    method: metadata.method,
    path: metadata.path,
    handlers
  }
}

export default defineAction