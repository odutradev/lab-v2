import jwt from 'jsonwebtoken'

import { requestCodeParamsSchema, requestCodeBodySchema, verifyCodeParamsSchema, verifyCodeBodySchema, verificationResponseSchema, errorResponseSchema } from '@domains/users/actions/validation/schemas'
import verificationCodeRepository from '@domains/users/repositories/verificationCode'
import { sensitiveEndpointRateLimitConfig } from '@config/rateLimit'
import verificationCodeTemplate from '@email/templates/verificationCode'
import userRepository from '@domains/users/repositories/user'
import defineAction from '@factories/defineAction'
import createAuditLog from '@createAuditLog'
import createLocalLogger from '@utils/localLogger'

import type { RequestCodeParams, RequestCodeBody, VerifyCodeParams, VerifyCodeBody } from '@domains/users/actions/validation/types'

const logger = createLocalLogger('validation-actions')

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
      },
      500: {
        description: 'Falha ao enviar e-mail com código de verificação',
        schema: errorResponseSchema
      }
    }
  },
  async ({ params, data, manageError }) => {
    const { purpose } = params as RequestCodeParams
    const { email } = data as RequestCodeBody

    logger.info(`[requestCodeAction] Recebida solicitação de código de verificação para "${email}" (finalidade: "${purpose}")`)

    const user = await userRepository.findByEmail(email)

    if (!user) {
      logger.warn(`[requestCodeAction] Usuário não localizado no sistema para o e-mail: "${email}"`)
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

    logger.info(`[requestCodeAction] Código de verificação gerado para "${email}" (${purpose}). Disparando envio de e-mail...`)

    const emailResult = await verificationCodeTemplate.send({
      to: email,
      variables: { code }
    })

    if (!emailResult.success) {
      logger.error(`[requestCodeAction] Falha ao enviar código de verificação para "${email}": ${emailResult.error}`)

      await createAuditLog({
        actorId: user.id,
        action: 'request_verification_code_failed',
        entity: 'User',
        entityId: user.id,
        summary: `Falha ao enviar código de verificação (${purpose}) para o e-mail: ${email}. Motivo: ${emailResult.error}`,
        details: {
          email,
          purpose,
          error: emailResult.error
        }
      })

      return manageError({
        code: 'internal_error',
        details: [{ field: 'email', message: emailResult.error || 'Falha no envio do e-mail' }]
      })
    }

    logger.success(`[requestCodeAction] Código de verificação (${purpose}) enviado com sucesso para "${email}". Message ID: ${emailResult.messageId}`)

    await createAuditLog({
      actorId: user.id,
      action: 'request_verification_code',
      entity: 'User',
      entityId: user.id,
      summary: `Código de verificação (${purpose}) enviado com sucesso para o e-mail: ${email}.`,
      details: {
        email,
        purpose,
        messageId: emailResult.messageId
      }
    })

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
      },
      400: {
        description: 'Código de verificação inválido ou expirado',
        schema: errorResponseSchema
      }
    }
  },
  async ({ params, data, manageError }) => {
    const { purpose } = params as VerifyCodeParams
    const { email, code } = data as VerifyCodeBody

    logger.info(`[verifyCodeAction] Validando código para "${email}" (finalidade: "${purpose}")`)

    const validCode = await verificationCodeRepository.findValidCode(email, code, purpose)

    if (!validCode) {
      logger.warn(`[verifyCodeAction] Código inválido ou expirado para o e-mail: "${email}" (${purpose})`)

      await createAuditLog({
        actorId: 'anonymous',
        action: 'verify_code_failed',
        entity: 'VerificationCode',
        summary: `Tentativa com código de verificação inválido ou expirado para o e-mail: ${email} (${purpose}).`,
        details: {
          email,
          purpose
        }
      })

      return manageError({ code: 'invalid_verification_code' })
    }

    if (purpose === 'email_verification') {
      const user = await userRepository.findByEmail(email)
      if (user) {
        await userRepository.updateEmailVerified(user.id, true)
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

    logger.success(`[verifyCodeAction] Código validado com sucesso para "${email}" (${purpose})`)

    return {
      success: true,
      resetToken
    }
  }
)