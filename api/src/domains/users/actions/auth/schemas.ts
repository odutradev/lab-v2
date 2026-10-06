import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import registry from '@factories/docs/registry'

extendZodWithOpenApi(z)

export const signUpBodySchema = registry.register('SignUpBody', z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
}))

export const signInBodySchema = registry.register('SignInBody', z.object({
  email: z.string().email(),
  password: z.string().min(6)
}))

export const refreshTokenBodySchema = registry.register('RefreshTokenBody', z.object({
  refreshToken: z.string()
}))

export const authResponseSchema = registry.register('AuthResponse', z.object({
  refreshToken: z.string(),
  token: z.string()
}))