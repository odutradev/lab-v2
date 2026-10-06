import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import { errorResponseSchema, errorDetailSchema } from '@factories/errors/schemas'
import registry from '@factories/docs/registry'

extendZodWithOpenApi(z)

export { errorResponseSchema, errorDetailSchema }

export const requestCodeParamsSchema = registry.register('RequestCodeParams', z.object({
  purpose: z.enum(['email_verification', 'password_reset'])
}))

export const requestCodeBodySchema = registry.register('RequestCodeBody', z.object({
  email: z.string().email()
}))

export const verifyCodeParamsSchema = registry.register('VerifyCodeParams', z.object({
  purpose: z.enum(['email_verification', 'password_reset'])
}))

export const verifyCodeBodySchema = registry.register('VerifyCodeBody', z.object({
  email: z.string().email(),
  code: z.string().length(6)
}))

export const verificationResponseSchema = registry.register('VerificationResponse', z.object({
  success: z.boolean(),
  resetToken: z.string().optional()
}))