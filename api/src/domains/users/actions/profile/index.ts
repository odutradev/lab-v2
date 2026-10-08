import jwt from 'jsonwebtoken'
import fs from 'fs/promises'

import {
  profileResponseSchema,
  updateProfileBodySchema,
  updateAvatarResponseSchema,
  resetPasswordBodySchema,
  resetPasswordResponseSchema,
  updateHealthBodySchema,
  userHealthSchema
} from '@domains/users/actions/profile/schemas'
import { errorResponseSchema } from '@domains/users/actions/validation/schemas'
import { sensitiveEndpointRateLimitConfig } from '@config/rateLimit'
import userRepository from '@domains/users/repositories/user'
import authMiddleware from '@domains/users/middlewares/auth'
import { createUploadMiddleware } from '@middlewares/upload'
import { deleteFile, uploadFile } from '@storage/utils'
import createLocalLogger from '@utils/localLogger'
import defineAction from '@factories/defineAction'
import createAuditLog from '@createAuditLog'
import { optimizeImage } from '@utils/image'
import { hashData } from '@utils/crypto'

import type {
  UpdateProfileBody,
  ResetPasswordBody,
  UpdateHealthBody
} from '@domains/users/actions/profile/types'

const logger = createLocalLogger('profile-actions')

export const getProfileAction = defineAction(
  {
    method: 'get',
    path: '/users/profile/details',
    summary: 'Busca os dados do usuário autenticado',
    tags: ['Profile'],
    responses: {
      200: {
        description: 'Dados obtidos com sucesso',
        schema: profileResponseSchema
      },
      404: {
        description: 'Usuário correspondente não encontrado',
        schema: errorResponseSchema
      }
    },
    middlewares: [authMiddleware]
  },
  async ({ ids, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const user = await userRepository.findById(ids.userId)

    if (!user) return manageError({ code: 'user_not_found' })

    return user
  }
)

export const updateProfileAction = defineAction(
  {
    method: 'put',
    path: '/users/profile/update',
    summary: 'Atualiza os dados do perfil do usuário',
    tags: ['Profile'],
    schema: { body: updateProfileBodySchema },
    responses: {
      200: {
        description: 'Perfil atualizado com sucesso',
        schema: profileResponseSchema
      },
      404: {
        description: 'Usuário correspondente não encontrado',
        schema: errorResponseSchema
      }
    },
    middlewares: [authMiddleware]
  },
  async ({ ids, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const payload = data as UpdateProfileBody
    const user = await userRepository.findById(ids.userId)

    if (!user) return manageError({ code: 'user_not_found' })

    const updatedUser = await userRepository.update(ids.userId, payload)

    if (!updatedUser) return manageError({ code: 'user_not_found' })

    await createAuditLog({
      actorId: ids.userId,
      action: 'update_profile',
      entity: 'User',
      entityId: ids.userId,
      summary: 'Perfil do usuário atualizado com sucesso.',
      details: payload
    })

    return updatedUser
  }
)

export const updateAvatarAction = defineAction(
  {
    method: 'patch',
    path: '/users/profile/update-avatar',
    summary: 'Atualiza a foto de perfil do usuário',
    tags: ['Profile'],
    requestFormat: 'multipart',
    uploadFieldName: 'avatar',
    responses: {
      200: {
        description: 'Foto atualizada com sucesso',
        schema: updateAvatarResponseSchema
      },
      404: {
        description: 'Usuário correspondente não encontrado',
        schema: errorResponseSchema
      }
    },
    middlewares: [
      authMiddleware,
      createUploadMiddleware({
        fieldName: 'avatar',
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxSizeInBytes: 5 * 1024 * 1024
      })
    ]
  },
  async ({ ids, file, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    if (!file?.path) return manageError({ code: 'bad_request', details: [{ field: 'avatar', message: 'Nenhuma imagem enviada' }] })

    const user = await userRepository.findById(ids.userId)

    if (!user) return manageError({ code: 'user_not_found' })

    if (user.avatar) {
      try {
        const urlParts = user.avatar.split('/')
        const usersIndex = urlParts.indexOf('users')

        if (usersIndex !== -1) {
          const oldPath = urlParts.slice(usersIndex).join('/')
          await deleteFile({ path: oldPath })
        }
      } catch (error) {
        logger.error('Failed to delete old avatar', error)
      }
    }

    const fileBuffer = await fs.readFile(file.path)
    const optimizedBuffer = await optimizeImage(fileBuffer, 500)

    const storagePath = `users/${ids.userId}/avatar-${Date.now()}.webp`

    const { url } = await uploadFile({
      path: storagePath,
      buffer: optimizedBuffer,
      mimeType: 'image/webp',
      isPublic: true
    })

    await userRepository.update(ids.userId, { avatar: url })

    await createAuditLog({
      actorId: ids.userId,
      action: 'update_avatar',
      entity: 'User',
      entityId: ids.userId,
      summary: 'Foto de perfil atualizada com sucesso.',
      details: { newAvatarUrl: url }
    })

    return { avatar: url }
  }
)

export const resetPasswordAction = defineAction(
  {
    method: 'post',
    path: '/users/profile/reset-password',
    summary: 'Redefine a senha do usuário utilizando um token de verificação',
    tags: ['Profile'],
    rateLimit: sensitiveEndpointRateLimitConfig,
    schema: { body: resetPasswordBodySchema },
    responses: {
      200: {
        description: 'Senha redefinida com sucesso',
        schema: resetPasswordResponseSchema
      },
      401: {
        description: 'Token de verificação inválido ou expirado',
        schema: errorResponseSchema
      },
      404: {
        description: 'Usuário correspondente não encontrado',
        schema: errorResponseSchema
      }
    }
  },
  async ({ data, manageError }) => {
    const { token, password } = data as ResetPasswordBody

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string; purpose: string }

      if (decoded.purpose !== 'password_reset') {
        return manageError({ code: 'invalid_token' })
      }

      const user = await userRepository.findByEmail(decoded.email)

      if (!user) {
        return manageError({ code: 'user_not_found' })
      }

      const passwordHash = hashData(password)
      await userRepository.updatePassword(user.id, passwordHash)

      await createAuditLog({
        actorId: user.id,
        action: 'reset_password',
        entity: 'User',
        entityId: user.id,
        summary: `Senha do usuário "${user.name}" redefinida com sucesso.`
      })

      return { success: true }
    } catch {
      return manageError({ code: 'invalid_token' })
    }
  }
)

export const updateHealthAction = defineAction(
  {
    method: 'patch',
    path: '/users/profile/health',
    summary: 'Atualiza os dados de saúde e biofísicos do usuário',
    tags: ['Profile'],
    schema: { body: updateHealthBodySchema },
    responses: {
      200: {
        description: 'Dados de saúde atualizados com sucesso',
        schema: userHealthSchema
      },
      404: {
        description: 'Usuário correspondente não encontrado',
        schema: errorResponseSchema
      }
    },
    middlewares: [authMiddleware]
  },
  async ({ ids, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const payload = data as UpdateHealthBody
    const user = await userRepository.findById(ids.userId)

    if (!user) return manageError({ code: 'user_not_found' })

    const updatedUser = await userRepository.update(ids.userId, { health: payload })

    if (!updatedUser) return manageError({ code: 'user_not_found' })

    return updatedUser.health || {}
  }
)