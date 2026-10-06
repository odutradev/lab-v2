import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import { isValidCpf, isValidDateString, isAfterDate } from '@domains/users/utils/validation'
import registry from '@factories/docs/registry'

extendZodWithOpenApi(z)

export const signUpBodySchema = registry.register('SignUpBody', z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  accountType: z.enum(['tenant', 'owner']),
  document: z.string().refine(isValidCpf, { message: 'Invalid CPF document' }),
  birthDate: z.string().refine(isValidDateString, { message: 'Birth date must be a valid date in YYYY-MM-DD format' }),
  phone: z.string(),
  referralSource: z.string(),
  academicData: z.object({
    institution: z.string(),
    course: z.string(),
    degreeLevel: z.enum(['undergraduate', 'master', 'doctorate']),
    courseStart: z.string().refine(isValidDateString, { message: 'Course start must be in YYYY-MM-DD format' }),
    courseEnd: z.string().refine(isValidDateString, { message: 'Course end must be in YYYY-MM-DD format' }),
    enrollmentId: z.string()
  }).optional()
}).superRefine((data, ctx) => {
  if (data.accountType === 'tenant') {
    if (!data.academicData) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Academic data is required for tenants',
        path: ['academicData']
      })
    } else {
      const ad = data.academicData
      if (!ad.institution) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Institution is required',
          path: ['academicData', 'institution']
        })
      }
      if (!ad.course) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Course is required',
          path: ['academicData', 'course']
        })
      }
      if (!ad.degreeLevel) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Degree level is required',
          path: ['academicData', 'degreeLevel']
        })
      }
      if (!ad.courseStart) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Course start date is required',
          path: ['academicData', 'courseStart']
        })
      }
      if (!ad.courseEnd) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Expected course completion date is required',
          path: ['academicData', 'courseEnd']
        })
      }
      if (!ad.enrollmentId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enrollment ID is required',
          path: ['academicData', 'enrollmentId']
        })
      }
      if (ad.courseStart && ad.courseEnd && !isAfterDate(ad.courseStart, ad.courseEnd)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Course completion date must be after start date',
          path: ['academicData', 'courseEnd']
        })
      }
    }
  }
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