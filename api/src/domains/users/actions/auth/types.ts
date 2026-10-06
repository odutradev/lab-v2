import type { signUpBodySchema, signInBodySchema, refreshTokenBodySchema, authResponseSchema } from '@domains/users/actions/auth/schemas'
import type { z } from 'zod'

export type SignUpBody = z.infer<typeof signUpBodySchema>
export type SignInBody = z.infer<typeof signInBodySchema>
export type AuthResponse = z.infer<typeof authResponseSchema>
export type RefreshTokenBody = z.infer<typeof refreshTokenBodySchema>