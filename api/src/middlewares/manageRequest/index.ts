import { buildRequestContext } from '@middlewares/manageRequest/context'
import { validateRequest } from '@middlewares/manageRequest/validation'
import { deleteUploadedFile } from '@middlewares/upload'
import createLocalLogger from '@utils/localLogger'
import sendError from '@factories/errors'

import type { ServiceFunction, RouteSchema, ManageRequestSchema, ManageErrorParams } from '@middlewares/manageRequest/types'
import type { RequestHandler, Response, Request } from 'express'

const logger = createLocalLogger('manage-request')

const manageRequest = <T extends ManageRequestSchema = ManageRequestSchema>(
  service: ServiceFunction<T>,
  schema?: RouteSchema
): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const manageError = ({ code, error, details }: ManageErrorParams): void => {
        sendError({ res, code, error, details, local: service.name })
      }
      if (schema) {
        const validation = validateRequest(req, schema)
        if (!validation.success) {
          manageError({
            code: 'validation_error',
            error: validation.error,
            details: validation.details
          })
          return
        }
      }
      const manageRequestBody = buildRequestContext<T>(req, res, manageError)
      const result = await service(manageRequestBody)
      if (result === 'error') return
      if (res.headersSent) return
      res.status(200).json(result)
    } catch (error) {
      if (res.headersSent) {
        logger.error(`Error after headers sent in ${service.name}:`, error)
        return
      }
      logger.error('Request internal error:', error)
      sendError({ code: 'internal_error', res })
    } finally {
      if (req.file) {
        deleteUploadedFile(req.file.path)
      }
    }
  }
}

export default manageRequest