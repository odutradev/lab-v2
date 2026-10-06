import { Request, Response, NextFunction, RequestHandler } from 'express'

import userRepository from '@domains/users/repositories/user'
import { errorResponseSchema } from '@factories/errors/schemas'
import sendError from '@factories/errors'

export const createAccountReadinessMiddleware = (role: 'tenant' | 'owner'): RequestHandler => {
  const middleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = res.locals.userId

    if (!userId) {
      sendError({ code: 'unauthorized', res, local: 'accountReadinessMiddleware' })
      return
    }

    try {
      const user = await userRepository.findById(userId)

      if (!user) {
        sendError({
          code: 'account_not_ready',
          res,
          local: 'accountReadinessMiddleware',
          details: [{ field: 'accountStatus', message: 'user_not_found' }]
        })
        return
      }

      if (user.accountStatus === 'blocked') {
        sendError({
          code: 'account_not_ready',
          res,
          local: 'accountReadinessMiddleware',
          details: [{ field: 'accountStatus', message: 'account_blocked' }]
        })
        return
      }

      next()
    } catch (error) {
      sendError({ code: 'internal_error', res, local: 'accountReadinessMiddleware', error })
    }
  }

  return Object.assign(middleware, {
    authenticate: true,
    responses: {
      403: {
        description: `Acesso negado - Conta de ${role} não possui todos os requisitos aprovados`,
        schema: errorResponseSchema
      }
    }
  })
}

export default createAccountReadinessMiddleware