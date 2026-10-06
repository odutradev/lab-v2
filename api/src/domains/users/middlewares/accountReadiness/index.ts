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
      const readiness = await userRepository.checkAccountReadiness(userId, role)

      if (!readiness || !readiness.isReady) {
        const issues = readiness?.issues || ['user_not_found']
        const details = issues.map((issue) => ({ field: 'accountStatus', message: issue }))

        sendError({
          code: 'account_not_ready',
          res,
          local: 'accountReadinessMiddleware',
          details
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