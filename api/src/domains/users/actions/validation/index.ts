import jwt from 'jsonwebtoken'

import { requestCodeParamsSchema, requestCodeBodySchema, verifyCodeParamsSchema, verifyCodeBodySchema, verificationResponseSchema, errorResponseSchema } from '@domains/users/actions/validation/schemas'
import verificationCodeRepository from '@domains/users/repositories/verificationCode'
import { sensitiveEndpointRateLimitConfig } from '@config/rateLimit'
import verificationCodeTemplate from '@email/templates/verificationCode'
import userRepository from '@domains/users/repositories/user'
import defineAction from '@factories/defineAction'
import createAuditLog from '@createAuditLog'

import type { RequestCodeParams, RequestCodeBody, VerifyCodeParams, VerifyCodeBody } from '@domains/users/actions/validation/types'

export const requestCodeAction = defineAction(
  {
    method: 'post',
    path: '/users/validation/request/:purpose',
    summary: 'Solicita um código de verificação temporário',
    tags: ['Validation'],
    rateLimit: sensitiveEndpointRateLimitConfig,
    schema: {
      params: requestCodeParamsSchema,
      body: requestCodeBodySchema
    },
    responses: {
      200: {
        description: 'Código de verificação enviado com sucesso',
        schema: verificationResponseSchema
      },
      404: {
        description: 'Usuário não localizado no sistema',
        schema: errorResponseSchema
      }
    }
  },
  async ({ params, data, manageError }) => {
    const { purpose } = params as RequestCodeParams
    const { email } = data as RequestCodeBody
    const user = await userRepository.findByEmail(email)

    if (!user) {
      return manageError({ code: 'user_not_found' })
    }

    await verificationCodeRepository.deleteExpiredCodes(email, purpose)

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    await verificationCodeRepository.create({
      email,
      code,
      purpose,
      userId: user.id,
      expiresAt
    })

    await Promise.all([
      verificationCodeTemplate.send({
        to: email,
        variables: { code }
      }),
      createAuditLog({
        actorId: user.id,
        action: 'request_verification_code',
        entity: 'User',
        summary: `Código de verificação enviado para o e-mail: ${email}.`,
        details: {
          email,
          purpose
        }
      })
    ])

    return {
      success: true
    }
  }
)

export const verifyCodeAction = defineAction(
  {
    method: 'post',
    path: '/users/validation/verify/:purpose',
    summary: 'Valida um código de verificação temporário',
    tags: ['Validation'],
    schema: {
      params: verifyCodeParamsSchema,
      body: verifyCodeBodySchema
    },
    responses: {
      200: {
        description: 'Código de verificação validado com sucesso',
        schema: verificationResponseSchema
      }
    }
  },
  async ({ params, data, manageError }) => {
    const { purpose } = params as VerifyCodeParams
    const { email, code } = data as VerifyCodeBody
    const validCode = await verificationCodeRepository.findValidCode(email, code, purpose)

    if (!validCode) {
      return manageError({ code: 'invalid_verification_code' })
    }

    if (purpose === 'email_verification') {
      const user = await userRepository.findByEmail(email)
      if (user) {
        await createAuditLog({
          actorId: user.id,
          action: 'verify_email',
          entity: 'User',
          entityId: user.id,
          summary: `E-mail do usuário "${user.name}" verificado com sucesso.`
        })
      }
    }

    let resetToken: string | undefined

    if (purpose === 'password_reset') {
      resetToken = jwt.sign(
        {
          email,
          purpose: 'password_reset'
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '15m' }
      )
    }

    await Promise.all([
      verificationCodeRepository.deleteCode(validCode.id),
      createAuditLog({
        actorId: validCode.userId ?? 'anonymous',
        action: 'verify_code_success',
        entity: 'VerificationCode',
        entityId: validCode.id,
        summary: `Código de verificação validado com sucesso para o e-mail: ${email}.`,
        details: {
          email,
          purpose
        }
      })
    ])

    return {
      success: true,
      resetToken
    }
  }
)