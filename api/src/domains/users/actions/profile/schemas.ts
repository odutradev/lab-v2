import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import registry from '@factories/docs/registry'

extendZodWithOpenApi(z)

export const userWeightRecordSchema = registry.register('UserWeightRecord', z.object({
  date: z.string(),
  weight: z.number()
}))

export const userSleepRecordSchema = registry.register('UserSleepRecord', z.object({
  date: z.string(),
  hours: z.number(),
  quality: z.number().min(1).max(5)
}))

export const userHealthSchema = registry.register('UserHealth', z.object({
  height: z.number().optional(),
  age: z.number().optional(),
  characterId: z.string().optional(),
  weightHistory: z.array(userWeightRecordSchema).optional(),
  sleepHistory: z.array(userSleepRecordSchema).optional(),
  waterDailyMap: z.record(z.string(), z.number()).optional(),
  waterExtraTargetMap: z.record(z.string(), z.number()).optional(),
  waterBottleMl: z.number().optional(),
  waterTargetBottles: z.number().optional()
}))

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
      calendarId: z.string().optional(),
      connectedAt: z.date().optional()
    }).optional()
  }).optional(),
  health: userHealthSchema.optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
}))

export const updateProfileBodySchema = registry.register('UpdateProfileBody', z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().optional(),
  health: userHealthSchema.partial().optional()
}))

export const updateHealthBodySchema = registry.register('UpdateHealthBody', userHealthSchema.partial())

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