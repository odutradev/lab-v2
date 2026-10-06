import fs from 'fs/promises'

import { uploadValidationDocumentBodySchema, uploadValidationDocumentResponseSchema, resubmitValidationDocumentBodySchema, resubmitValidationDocumentResponseSchema, listPendingValidationDocumentsParamsSchema, listPendingValidationDocumentsQuerySchema, listPendingValidationDocumentsResponseSchema, reviewValidationDocumentParamsSchema, reviewValidationDocumentBodySchema, reviewValidationDocumentResponseSchema, uploadOwnerContractResponseSchema } from '@domains/users/actions/document/schemas'
import { buildPaginatedResponse, getPaginationOptions } from '@factories/pagination'
import documentsApprovedTemplate from '@email/templates/documentsApproved'
import superAdminMiddleware from '@domains/users/middlewares/superAdmin'
import { errorResponseSchema } from '@factories/errors/schemas'
import userRepository from '@domains/users/repositories/user'
import { createUploadMiddleware } from '@middlewares/upload'
import authMiddleware from '@domains/users/middlewares/auth'
import defineAction from '@factories/defineAction'
import createAuditLog from '@createAuditLog'
import { optimizeImage } from '@utils/image'
import { uploadFile } from '@storage/utils'

import type { UploadValidationDocumentBody, ResubmitValidationDocumentBody, ListPendingValidationDocumentsParams, ListPendingValidationDocumentsQuery, ReviewValidationDocumentParams, ReviewValidationDocumentBody } from '@domains/users/actions/document/types'
import type { PaginationQuery } from '@factories/pagination/types'

export const uploadValidationDocumentAction = defineAction(
  {
    method: 'post',
    path: '/documents/users/validation/upload',
    summary: 'Envia um documento para validação (locatário ou proprietário)',
    tags: ['Users Documents'],
    requestFormat: 'multipart',
    uploadFieldName: 'document',
    schema: { body: uploadValidationDocumentBodySchema },
    responses: {
      200: {
        description: 'Documento enviado com sucesso',
        schema: uploadValidationDocumentResponseSchema
      },
      404: {
        description: 'Usuário correspondente não encontrado',
        schema: errorResponseSchema
      }
    },
    middlewares: [
      authMiddleware,
      createUploadMiddleware({
        fieldName: 'document',
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/webp'
        ],
        maxSizeInBytes: 5 * 1024 * 1024
      })
    ]
  },
  async ({ ids, data, file, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    if (!file?.path) {
      return manageError({
        code: 'bad_request',
        details: [
          {
            field: 'document',
            message: 'Nenhum documento enviado'
          }
        ]
      })
    }

    const userRepo = userRepository as any
    const { role, documentType } = data as UploadValidationDocumentBody
    const user = (await userRepository.findById(ids.userId)) as any

    if (!user) return manageError({ code: 'user_not_found' })

    if (user.accountStatus === 'blocked') {
      return manageError({ code: 'forbidden' })
    }

    if (role === 'tenant' && !user.isTenant) {
      return manageError({
        code: 'bad_request',
        details: [
          {
            field: 'role',
            message: 'Usuário não é locatário'
          }
        ]
      })
    }

    if (role === 'owner' && !user.isOwner) {
      return manageError({
        code: 'bad_request',
        details: [
          {
            field: 'role',
            message: 'Usuário não é proprietário'
          }
        ]
      })
    }

    const fileBuffer = await fs.readFile(file.path)
    const optimizedBuffer = await optimizeImage(fileBuffer, 800)

    const storagePath = `users/${ids.userId}/documents/${role}-${documentType}-${Date.now()}.webp`

    const { url } = await uploadFile({
      path: storagePath,
      buffer: optimizedBuffer,
      mimeType: 'image/webp',
      isPublic: false
    })

    await (userRepository as any).updateUserDocument(ids.userId, role, documentType, url)

    await createAuditLog({
      actorId: ids.userId,
      action: 'upload_document',
      entity: 'User',
      entityId: ids.userId,
      summary: `Documento "${documentType}" (${role}) enviado para validação.`,
      details: {
        role,
        documentType,
        url
      }
    })

    return {
      success: true
    }
  }
)

export const resubmitValidationDocumentAction = defineAction(
  {
    method: 'post',
    path: '/documents/users/validation/resubmit',
    summary: 'Reenvia um documento que foi previamente reprovado',
    tags: ['Users Documents'],
    requestFormat: 'multipart',
    uploadFieldName: 'document',
    schema: { body: resubmitValidationDocumentBodySchema },
    responses: {
      200: {
        description: 'Documento reenviado com sucesso',
        schema: resubmitValidationDocumentResponseSchema
      },
      404: {
        description: 'Usuário correspondente não encontrado',
        schema: errorResponseSchema
      }
    },
    middlewares: [
      authMiddleware,
      createUploadMiddleware({
        fieldName: 'document',
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/webp'
        ],
        maxSizeInBytes: 5 * 1024 * 1024
      })
    ]
  },
  async ({ ids, data, file, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    if (!file?.path) {
      return manageError({
        code: 'bad_request',
        details: [
          {
            field: 'document',
            message: 'Nenhum documento enviado'
          }
        ]
      })
    }

    const { role, documentType } = data as ResubmitValidationDocumentBody
    const user = (await userRepository.findById(ids.userId)) as any

    if (!user) return manageError({ code: 'user_not_found' })

    if (user.accountStatus === 'blocked') {
      return manageError({ code: 'forbidden' })
    }

    const userDocuments = user.documents?.[role] as unknown as Record<string, any>
    const currentDocument = userDocuments?.[documentType]

    if (!currentDocument || currentDocument.status !== 'rejected') {
      return manageError({
        code: 'bad_request',
        details: [
          {
            field: 'documentType',
            message: 'Apenas documentos reprovados podem ser reenviados por este endpoint'
          }
        ]
      })
    }

    const currentCount = currentDocument.resubmitCount || 0

    if (currentCount >= 3) {
      await userRepository.updateAccountStatus(ids.userId, 'blocked')
      await createAuditLog({
        actorId: ids.userId,
        action: 'account_blocked',
        entity: 'User',
        entityId: ids.userId,
        summary: `Conta bloqueada. Limite de reenvios excedido para o documento "${documentType}" (${role}).`,
        details: {
          role,
          documentType,
          currentCount
        }
      })
      return manageError({
        code: 'forbidden',
        details: [
          {
            field: 'documentType',
            message: 'Limite de 3 reenvios excedido. Conta bloqueada automaticamente.'
          }
        ]
      })
    }

    const fileBuffer = await fs.readFile(file.path)
    const optimizedBuffer = await optimizeImage(fileBuffer, 800)

    const storagePath = `users/${ids.userId}/documents/${role}-${documentType}-resubmitted-${Date.now()}.webp`

    const { url } = await uploadFile({
      path: storagePath,
      buffer: optimizedBuffer,
      mimeType: 'image/webp',
      isPublic: false
    })

    await (userRepository as any).updateUserDocument(ids.userId, role, documentType, url, true)

    await createAuditLog({
      actorId: ids.userId,
      action: 'resubmit_document',
      entity: 'User',
      entityId: ids.userId,
      summary: `Documento "${documentType}" (${role}) reenviado para validação.`,
      details: {
        role,
        documentType,
        url
      }
    })

    return {
      success: true
    }
  }
)

export const listPendingValidationDocumentsAction = defineAction(
  {
    method: 'get',
    path: '/documents/users/validation/pending/:type',
    summary: 'Lista usuários com documentação pendente de validação',
    tags: ['Users Documents'],
    schema: {
      params: listPendingValidationDocumentsParamsSchema,
      query: listPendingValidationDocumentsQuerySchema
    },
    responses: {
      200: {
        description: 'Lista paginada de documentações pendentes ordenadas por envio mais antigo',
        schema: listPendingValidationDocumentsResponseSchema
      }
    },
    middlewares: [authMiddleware, superAdminMiddleware]
  },
  async ({ params, query }) => {
    const { type } = params as ListPendingValidationDocumentsParams
    const paginationQuery = query as ListPendingValidationDocumentsQuery
    const { limit, offset, page } = getPaginationOptions(paginationQuery as PaginationQuery)
    
    const result = await (userRepository as any).listPendingDocuments({ limit, offset, type })
    const formattedRows = result.rows.map((doc: any) => {
      const { _id, __v, ...rest } = doc
      return { id: _id?.toString(), ...rest }
    })

    return buildPaginatedResponse({ count: result.count, rows: formattedRows }, page, limit)
  }
)

export const reviewValidationDocumentAction = defineAction(
  {
    method: 'patch',
    path: '/documents/users/:userId/validation/review',
    summary: 'Aprova ou reprova um documento específico',
    tags: ['Users Documents'],
    schema: {
      params: reviewValidationDocumentParamsSchema,
      body: reviewValidationDocumentBodySchema
    },
    responses: {
      200: {
        description: 'Status do documento atualizado com sucesso',
        schema: reviewValidationDocumentResponseSchema
      },
      404: {
        description: 'Usuário ou documento não encontrado',
        schema: errorResponseSchema
      }
    },
    middlewares: [
      authMiddleware,
      superAdminMiddleware
    ]
  },
  async ({ ids, params, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { userId } = params as ReviewValidationDocumentParams
    const { role, documentType, status } = data as ReviewValidationDocumentBody

    const reviewerUser = await userRepository.findById(ids.userId)

    if (!reviewerUser) return manageError({ code: 'unauthorized' })

    const user = (await userRepository.findById(userId)) as any

    if (!user) return manageError({ code: 'user_not_found' })

    const documentInfo = user.documents?.[role] as unknown as Record<string, any>

    if (!documentInfo || !documentInfo[documentType] || !documentInfo[documentType].reference) {
      return manageError({
        code: 'bad_request',
        details: [
          {
            field: 'documentType',
            message: 'Documento não enviado ou inválido para revisão'
          }
        ]
      })
    }

    const previousRoleStatus = user.documents?.[role]?.status

    const updatedUser = await (userRepository as any).reviewUserDocument(
      userId,
      role,
      documentType,
      status,
      {
        id: ids.userId,
        name: reviewerUser.name
      }
    )

    const newRoleStatus = updatedUser?.documents?.[role]?.status

    const tasks: Promise<unknown>[] = [
      createAuditLog({
        actorId: ids.userId,
        action: `review_document_${status}`,
        entity: 'User',
        entityId: userId,
        summary: `Documento "${documentType}" do perfil "${role}" foi ${status === 'approved' ? 'aprovado' : 'reprovado'}.`,
        details: {
          role,
          documentType,
          status
        }
      })
    ]

    if (previousRoleStatus !== 'approved' && newRoleStatus === 'approved') {
      tasks.push(
        documentsApprovedTemplate.send({
          to: user.email,
          variables: {
            name: user.name,
            role: role === 'tenant' ? 'Locatário' : 'Proprietário'
          }
        })
      )
    }

    await Promise.all(tasks)

    return {
      success: true
    }
  }
)

export const uploadOwnerContractAction = defineAction(
  {
    method: 'post',
    path: '/documents/users/owner/contract',
    summary: 'Envia o contrato assinado do proprietário',
    tags: ['Users Documents'],
    requestFormat: 'multipart',
    uploadFieldName: 'contract',
    responses: {
      200: {
        description: 'Contrato enviado com sucesso',
        schema: uploadOwnerContractResponseSchema
      },
      404: {
        description: 'Usuário não encontrado',
        schema: errorResponseSchema
      }
    },
    middlewares: [
      authMiddleware,
      createUploadMiddleware({
        fieldName: 'contract',
        allowedMimeTypes: ['application/pdf'],
        maxSizeInBytes: 10 * 1024 * 1024
      })
    ]
  },
  async ({ ids, file, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    if (!file?.path) {
      return manageError({
        code: 'bad_request',
        details: [
          {
            field: 'contract',
            message: 'Nenhum arquivo enviado ou formato inválido (apenas PDF)'
          }
        ]
      })
    }

    const user = (await userRepository.findById(ids.userId)) as any

    if (!user) return manageError({ code: 'user_not_found' })

    if (user.accountStatus === 'blocked') {
      return manageError({ code: 'forbidden' })
    }

    if (!user.isOwner) {
      return manageError({
        code: 'bad_request',
        details: [
          {
            field: 'role',
            message: 'Usuário não é proprietário'
          }
        ]
      })
    }

    if (user.documents?.owner?.status !== 'approved') {
      return manageError({
        code: 'bad_request',
        details: [
          {
            field: 'status',
            message: 'Documentação do proprietário não está aprovada'
          }
        ]
      })
    }

    if (user.documents?.owner?.contract) {
      return manageError({
        code: 'conflict',
        details: [
          {
            field: 'contract',
            message: 'Contrato já foi enviado anteriormente'
          }
        ]
      })
    }

    const fileBuffer = await fs.readFile(file.path)
    const storagePath = `users/${ids.userId}/documents/owner-contract-${Date.now()}.pdf`

    const { url } = await uploadFile({
      path: storagePath,
      buffer: fileBuffer,
      mimeType: 'application/pdf',
      isPublic: false
    })

    await (userRepository as any).updateOwnerContract(ids.userId, url)

    await createAuditLog({
      actorId: ids.userId,
      action: 'upload_owner_contract',
      entity: 'User',
      entityId: ids.userId,
      summary: 'Contrato do proprietário enviado com sucesso.',
      details: { url }
    })

    return {
      success: true
    }
  }
)