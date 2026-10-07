import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import registry from '@factories/docs/registry'

extendZodWithOpenApi(z)

export const profileResponseSchema = registry.register('ProfileResponse', z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  avatar: z.string().optional(),
  superAdmin: z.boolean(),
  emailVerified: z.boolean().optional(),
  accountStatus: z.enum(['active', 'blocked']),
  integrations: z.object({
    googleCalendar: z.object({
      connected: z.boolean(),
      email: z.string().optional(),
      connectedAt: z.date().optional()
    }).optional()
  }).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
}))

export const updateProfileBodySchema = registry.register('UpdateProfileBody', z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().optional()
}))

export const updateAvatarResponseSchema = registry.register('UpdateAvatarResponse', z.object({
  avatar: z.string()
}))

export const resetPasswordBodySchema = registry.register('ResetPasswordBody', z.object({
  token: z.string(),
  password: z.string().min(6)
}))

export const resetPasswordResponseSchema = registry.register('ResetPasswordResponse', z.object({
  success: z.boolean()
}))