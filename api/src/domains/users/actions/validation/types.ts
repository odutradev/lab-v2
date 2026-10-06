import type { requestCodeParamsSchema, requestCodeBodySchema, verifyCodeParamsSchema, verifyCodeBodySchema, verificationResponseSchema } from '@domains/users/actions/validation/schemas'
import type { z } from 'zod'

export type RequestCodeParams = z.infer<typeof requestCodeParamsSchema>
export type RequestCodeBody = z.infer<typeof requestCodeBodySchema>
export type VerifyCodeParams = z.infer<typeof verifyCodeParamsSchema>
export type VerifyCodeBody = z.infer<typeof verifyCodeBodySchema>
export type VerificationResponse = z.infer<typeof verificationResponseSchema>