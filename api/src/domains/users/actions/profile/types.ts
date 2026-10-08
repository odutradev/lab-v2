import type {
  profileResponseSchema,
  updateProfileBodySchema,
  updateAvatarResponseSchema,
  resetPasswordBodySchema,
  resetPasswordResponseSchema,
  updateHealthBodySchema,
  userHealthSchema
} from '@domains/users/actions/profile/schemas'
import type { z } from 'zod'

export type UpdateAvatarResponse = z.infer<typeof updateAvatarResponseSchema>
export type ResetPasswordResponse = z.infer<typeof resetPasswordResponseSchema>
export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>
export type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>
export type ProfileResponse = z.infer<typeof profileResponseSchema>
export type UpdateHealthBody = z.infer<typeof updateHealthBodySchema>
export type UserHealthResponse = z.infer<typeof userHealthSchema>