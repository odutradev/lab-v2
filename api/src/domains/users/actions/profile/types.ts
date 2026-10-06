import type {
  profileResponseSchema,
  updateProfileBodySchema,
  updateAvatarResponseSchema,
  resetPasswordBodySchema,
  resetPasswordResponseSchema
} from '@domains/users/actions/profile/schemas'
import type { z } from 'zod'

export type UpdateAvatarResponse = z.infer<typeof updateAvatarResponseSchema>
export type ResetPasswordResponse = z.infer<typeof resetPasswordResponseSchema>
export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>
export type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>
export type ProfileResponse = z.infer<typeof profileResponseSchema>