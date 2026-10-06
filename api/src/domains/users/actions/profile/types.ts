import type { profileResponseSchema, updateProfileBodySchema, updateAvatarResponseSchema, resetPasswordBodySchema, resetPasswordResponseSchema, updateBankDetailsBodySchema, updateBankDetailsResponseSchema, bankDetailsSchema, accountStatusParamsSchema, accountStatusResponseSchema, activateRoleBodySchema, activateRoleResponseSchema } from '@domains/users/actions/profile/schemas'
import type { z } from 'zod'

export type UpdateBankDetailsResponse = z.infer<typeof updateBankDetailsResponseSchema>
export type ActivateRoleResponse = z.infer<typeof activateRoleResponseSchema>
export type AccountStatusResponse = z.infer<typeof accountStatusResponseSchema>
export type UpdateBankDetailsBody = z.infer<typeof updateBankDetailsBodySchema>
export type UpdateAvatarResponse = z.infer<typeof updateAvatarResponseSchema>
export type ResetPasswordResponse = z.infer<typeof resetPasswordResponseSchema>
export type AccountStatusParams = z.infer<typeof accountStatusParamsSchema>
export type ActivateRoleBody = z.infer<typeof activateRoleBodySchema>
export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>
export type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>
export type ProfileResponse = z.infer<typeof profileResponseSchema>
export type BankDetails = z.infer<typeof bankDetailsSchema>