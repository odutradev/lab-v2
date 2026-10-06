import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

import { errorResponseSchema } from '@factories/errors/schemas'
import sendError from '@factories/errors'

import type { TokenPayload } from '@domains/users/middlewares/auth/types'

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    sendError({ code: 'no_token', res, local: 'authMiddleware' })
    return
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    sendError({ code: 'no_token', res, local: 'authMiddleware' })
    return
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload

    const extractedUserId = decoded.userId || decoded.id || decoded.sub

    if (!extractedUserId) {
      sendError({ code: 'token_is_not_valid', res, local: 'authMiddleware' })
      return
    }

    res.locals.userId = extractedUserId
    next()
  } catch (error) {
    sendError({ code: 'token_is_not_valid', res, local: 'authMiddleware', error })
  }
}

const authMiddlewareWithDocs = Object.assign(authMiddleware, {
  authenticate: true,
  responses: {
    401: {
      description: 'Token de autenticação não fornecido ou inválido',
      schema: errorResponseSchema
    }
  }
})

export default authMiddlewareWithDocs