import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import { createPaginatedSchema, paginationQuerySchema } from '@factories/pagination/schemas'
import registry from '@factories/docs/registry'

extendZodWithOpenApi(z)

export const uploadValidationDocumentBodySchema = registry.register('UploadValidationDocumentBody', z.object({
  role: z.enum(['tenant', 'owner']),
  documentType: z.enum(['identityFront', 'identityBack', 'selfie', 'enrollmentProof', 'residencyProof'])
}).superRefine((data, ctx) => {
  if (data.role === 'tenant' && data.documentType === 'residencyProof') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Tenants cannot upload residency proof',
      path: ['documentType']
    })
  }
  if (data.role === 'owner' && data.documentType === 'enrollmentProof') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Owners cannot upload enrollment proof',
      path: ['documentType']
    })
  }
}))

export const uploadValidationDocumentResponseSchema = registry.register('UploadValidationDocumentResponse', z.object({
  success: z.boolean()
}))

export const resubmitValidationDocumentBodySchema = registry.register('ResubmitValidationDocumentBody', z.object({
  role: z.enum(['tenant', 'owner']),
  documentType: z.enum(['identityFront', 'identityBack', 'selfie', 'enrollmentProof', 'residencyProof'])
}).superRefine((data, ctx) => {
  if (data.role === 'tenant' && data.documentType === 'residencyProof') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Tenants cannot upload residency proof',
      path: ['documentType']
    })
  }
  if (data.role === 'owner' && data.documentType === 'enrollmentProof') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Owners cannot upload enrollment proof',
      path: ['documentType']
    })
  }
}))

export const resubmitValidationDocumentResponseSchema = registry.register('ResubmitValidationDocumentResponse', z.object({
  success: z.boolean()
}))

export const listPendingValidationDocumentsParamsSchema = registry.register('ListPendingValidationDocumentsParams', z.object({
  type: z.enum(['tenant', 'owner', 'all']).default('all')
}))

export const listPendingValidationDocumentsQuerySchema = paginationQuerySchema

export const pendingValidationDocumentUserSchema = registry.register('PendingValidationDocumentUser', z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  documents: z.object({
    tenant: z.object({ status: z.string() }).passthrough().optional(),
    owner: z.object({ status: z.string() }).passthrough().optional()
  }).optional()
}).passthrough())

export const listPendingValidationDocumentsResponseSchema = createPaginatedSchema(pendingValidationDocumentUserSchema, 'PaginatedPendingValidationDocuments')

export const reviewValidationDocumentParamsSchema = registry.register('ReviewValidationDocumentParams', z.object({
  userId: z.string()
}))

export const reviewValidationDocumentBodySchema = registry.register('ReviewValidationDocumentBody', z.object({
  role: z.enum(['tenant', 'owner']),
  documentType: z.enum(['identityFront', 'identityBack', 'selfie', 'enrollmentProof', 'residencyProof']),
  status: z.enum(['approved', 'rejected'])
}).superRefine((data, ctx) => {
  if (data.role === 'tenant' && data.documentType === 'residencyProof') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Tenants cannot have residency proof',
      path: ['documentType']
    })
  }
  if (data.role === 'owner' && data.documentType === 'enrollmentProof') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Owners cannot have enrollment proof',
      path: ['documentType']
    })
  }
}))

export const reviewValidationDocumentResponseSchema = registry.register('ReviewValidationDocumentResponse', z.object({
  success: z.boolean()
}))

export const uploadOwnerContractResponseSchema = registry.register('UploadOwnerContractResponse', z.object({
  success: z.boolean()
}))