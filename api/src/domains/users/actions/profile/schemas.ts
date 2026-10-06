import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import registry from '@factories/docs/registry'

extendZodWithOpenApi(z)

export const bankDetailsSchema = registry.register('BankDetails', z.object({
  bankName: z.string(),
  pixKeyType: z.enum(['cpf', 'cnpj', 'email', 'phone', 'random']),
  pixKey: z.string(),
  accountHolder: z.string()
}))

export const academicDataResponseSchema = registry.register('AcademicDataResponse', z.object({
  institution: z.string(),
  course: z.string(),
  degreeLevel: z.enum(['undergraduate', 'master', 'doctorate']),
  courseStart: z.string(),
  courseEnd: z.string(),
  enrollmentId: z.string()
}))

export const profileResponseSchema = registry.register('ProfileResponse', z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  avatar: z.string().optional(),
  document: z.string(),
  birthDate: z.string(),
  phone: z.string(),
  referralSource: z.string(),
  academicData: academicDataResponseSchema.optional(),
  ownerType: z.enum(['individual', 'legal_entity']).optional(),
  bankDetails: bankDetailsSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date()
}))

export const updateProfileBodySchema = registry.register('UpdateProfileBody', z.object({
  academicData: academicDataResponseSchema.optional(),
  phone: z.string().optional()
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

export const updateBankDetailsBodySchema = registry.register('UpdateBankDetailsBody', bankDetailsSchema)

export const updateBankDetailsResponseSchema = registry.register('UpdateBankDetailsResponse', z.object({
  success: z.boolean()
}))

export const accountStatusParamsSchema = registry.register('AccountStatusParams', z.object({
  accountType: z.enum(['tenant', 'owner'])
}))

export const accountStatusResponseSchema = registry.register('AccountStatusResponse', z.object({
  isReady: z.boolean(),
  issues: z.array(z.string())
}))

export const activateRoleBodySchema = registry.register('ActivateRoleBody', z.object({
  role: z.enum(['tenant', 'owner'])
}))

export const activateRoleResponseSchema = registry.register('ActivateRoleResponse', z.object({
  success: z.boolean(),
  activatedRole: z.enum(['tenant', 'owner'])
}))