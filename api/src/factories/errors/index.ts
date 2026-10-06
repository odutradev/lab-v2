import { ResponseErrors } from '@factories/errors/constants'
import createLocalLogger from '@utils/localLogger'

import type { SendErrorParams } from '@factories/errors/types'

const logger = createLocalLogger('error-handler')

const sendError = ({ code, res, error, details, local }: SendErrorParams): string => {
  try {
    const localMessage = local ? `[${local}] ` : ''
    const responseError = ResponseErrors[code]

    logger.error(`${localMessage}${responseError.message}`)

    if (error) {
      logger.error('Error details:', error)
    }

    if (res.headersSent) return 'error'

    const payload = {
      success: false,
      code,
      message: responseError.message,
      ...(details ? { details } : {})
    }

    res.status(responseError.statusCode).json(payload)

    return 'error'
  } catch (err) {
    logger.error('[sendError] Server error')

    if (err) {
      logger.error('Error details:', err)
    }

    if (!res.headersSent) {
      res.status(500).json(ResponseErrors.internal_error)
    }

    return 'error'
  }
}

export default sendError