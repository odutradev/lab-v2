import { Request, Response, NextFunction } from 'express'

import { errorResponseSchema } from '@factories/errors/schemas'
import userRepository from '@domains/users/repositories/user'
import sendError from '@factories/errors'

const superAdminMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = res.locals.userId

  if (!userId) {
    sendError({ code: 'unauthorized', res, local: 'superAdminMiddleware' })
    return
  }

  try {
    const user = await userRepository.findById(userId)

    if (!user || !user.superAdmin) {
      sendError({ code: 'forbidden', res, local: 'superAdminMiddleware' })
      return
    }

    next()
  } catch (error) {
    sendError({ code: 'internal_error', res, local: 'superAdminMiddleware', error })
  }
}

const superAdminMiddlewareWithDocs = Object.assign(superAdminMiddleware, {
  authenticate: true,
  responses: {
    401: {
      description: 'Token de autenticação não fornecido ou inválido',
      schema: errorResponseSchema
    },
    403: {
      description: 'Acesso negado - Requer privilégios de Super Administrador',
      schema: errorResponseSchema
    }
  }
})

export default superAdminMiddlewareWithDocs