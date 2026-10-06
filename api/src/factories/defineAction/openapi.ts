import { z } from 'zod'

import { errorResponseSchema } from '@factories/errors/schemas'
import registry from '@factories/docs/registry'

import type { RouteConfig } from '@asteasolutions/zod-to-openapi'
import type { ActionMetadata, ResponseConfig } from './types'
import type { ZodTypeAny } from 'zod'

export const registerOpenApiAction = (metadata: ActionMetadata): void => {
  const defaultResponses: Record<string, ResponseConfig> = {
    200: { description: 'Sucesso' },
    400: { description: 'Requisição inválida' },
    422: { description: 'Erro de validação dos dados', schema: errorResponseSchema },
    500: { description: 'Erro interno' }
  }

  const middlewareResponses: Record<string, ResponseConfig> = {}
  let middlewareAuthenticate = false

  if (metadata.middlewares) {
    metadata.middlewares.forEach((mw) => {
      const documentedMw = mw as {
        authenticate?: boolean
        responses?: Record<string, ResponseConfig>
      }

      if (documentedMw.authenticate) {
        middlewareAuthenticate = true
      }

      if (documentedMw.responses) {
        Object.entries(documentedMw.responses).forEach(([code, config]) => {
          middlewareResponses[code] = config
        })
      }
    })
  }

  const mergedResponses = { ...defaultResponses, ...middlewareResponses, ...metadata.responses }

  const responses = Object.entries(mergedResponses).reduce<RouteConfig['responses']>(
    (acc, [code, value]) => ({
      ...acc,
      [code]: {
        description: value.description,
        content: value.schema
          ? { 'application/json': { schema: value.schema as ZodTypeAny } }
          : undefined
      }
    }),
    {}
  )

  const isAuthenticate = metadata.authenticate ?? middlewareAuthenticate

  const security = metadata.security ?? (isAuthenticate
    ? [{ bearerAuth: [] }]
    : undefined)

  let bodySchema = metadata.schema?.body

  if (metadata.requestFormat === 'multipart') {
    const fieldName = metadata.uploadFieldName ?? 'file'
    const fileSchema = z.string().openapi({ type: 'string', format: 'binary', description: 'Upload file' })

    if (bodySchema instanceof z.ZodObject) {
      bodySchema = bodySchema.extend({
        [fieldName]: fileSchema
      })
    } else {
      bodySchema = z.object({
        [fieldName]: fileSchema
      })
    }
  }

  const requestBody = metadata.requestBody
    ?? (bodySchema
      ? {
          content: {
            [metadata.requestFormat === 'multipart' ? 'multipart/form-data' : 'application/json']: {
              schema: bodySchema as ZodTypeAny
            }
          }
        }
      : undefined)

  const request: RouteConfig['request'] = {
    params: metadata.schema?.params,
    query: metadata.schema?.query,
    body: requestBody
  }

  const openApiPath = metadata.path.replace(/:([a-zA-Z0-9_]+)/g, '{$1}')

  registry.registerPath({
    method: metadata.method,
    path: openApiPath,
    summary: metadata.summary,
    tags: metadata.tags,
    security,
    request,
    responses
  })
}