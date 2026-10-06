import jwt from 'jsonwebtoken'

import { signUpBodySchema, signInBodySchema, refreshTokenBodySchema, authResponseSchema } from '@domains/users/actions/auth/schemas'
import { errorResponseSchema } from '@domains/users/actions/validation/schemas'
import { sensitiveEndpointRateLimitConfig } from '@config/rateLimit'
import userRepository from '@domains/users/repositories/user'
import welcomeTemplate from '@email/templates/welcome'
import { hashData, compareHash } from '@utils/crypto'
import defineAction from '@factories/defineAction'
import createAuditLog from '@createAuditLog'

import type { SignUpBody, SignInBody, RefreshTokenBody } from '@domains/users/actions/auth/types'

export const signUpAction = defineAction(
  {
    method: 'post',
    path: '/users/signup',
    summary: 'Cria uma nova conta de usuário',
    tags: ['Auth'],
    rateLimit: sensitiveEndpointRateLimitConfig,
    schema: { body: signUpBodySchema },
    responses: {
      200: {
        description: 'Usuário cadastrado com sucesso',
        schema: authResponseSchema
      },
      409: {
        description: 'E-mail já cadastrado',
        schema: errorResponseSchema
      }
    }
  },
  async ({ data, manageError }) => {
    const {
      name,
      email,
      password,
      accountType,
      document,
      birthDate,
      phone,
      referralSource,
      academicData
    } = data as SignUpBody
    const existingUser = await userRepository.findByEmail(email)

    if (existingUser) {
      return manageError({
        code: 'conflict',
        details: [{ field: 'email', message: 'E-mail já cadastrado' }]
      })
    }

    const passwordHash = hashData(password)
    const isTenant = accountType === 'tenant'
    const isOwner = accountType === 'owner'

    const newUser = await userRepository.create({
      name,
      email,
      passwordHash,
      isTenant,
      isOwner,
      document,
      birthDate,
      phone,
      referralSource,
      academicData
    })
    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET as string, { expiresIn: '3d' })
    const refreshToken = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET as string, { expiresIn: '10d' })

    await Promise.all([
      createAuditLog({
        actorId: newUser.id,
        action: 'create_user',
        entity: 'User',
        entityId: newUser.id,
        summary: `Usuário "${newUser.name}" cadastrado com sucesso.`,
        details: { name: newUser.name, email: newUser.email }
      }),
      welcomeTemplate.send({
        to: newUser.email,
        variables: { name: newUser.name }
      })
    ])

    return { refreshToken, token }
  }
)

export const signInAction = defineAction(
  {
    method: 'post',
    path: '/users/signin',
    summary: 'Autentica um usuário',
    tags: ['Auth'],
    rateLimit: sensitiveEndpointRateLimitConfig,
    schema: { body: signInBodySchema },
    responses: {
      200: {
        description: 'Autenticado com sucesso',
        schema: authResponseSchema
      },
      401: {
        description: 'Credenciais inválidas',
        schema: errorResponseSchema
      }
    }
  },
  async ({ data, manageError }) => {
    const { email, password } = data as SignInBody
    const user = await userRepository.findByEmailWithPassword(email)

    if (!user) return manageError({ code: 'invalid_credentials' })

    const isValidPassword = compareHash(password, user.password)

    if (!isValidPassword) return manageError({ code: 'invalid_credentials' })

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '3d' })
    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '10d' })

    await createAuditLog({
      actorId: user.id,
      action: 'signin_user',
      entity: 'User',
      entityId: user.id,
      summary: `Usuário "${user.name}" realizou login com sucesso.`,
      details: { email: user.email }
    })

    return { refreshToken, token }
  }
)

export const refreshTokenAction = defineAction(
  {
    method: 'post',
    path: '/users/refresh',
    summary: 'Renova o token de acesso utilizando um refresh token',
    tags: ['Auth'],
    schema: { body: refreshTokenBodySchema },
    responses: {
      200: {
        description: 'Token renovado com sucesso',
        schema: authResponseSchema
      },
      401: {
        description: 'Token de acesso inválido ou expirado',
        schema: errorResponseSchema
      },
      404: {
        description: 'Usuário não encontrado',
        schema: errorResponseSchema
      }
    }
  },
  async ({ data, manageError }) => {
    const { refreshToken } = data as RefreshTokenBody

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as { userId: string }
      const user = await userRepository.findById(decoded.userId)

      if (!user) return manageError({ code: 'user_not_found' })

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '3d' })
      const newRefreshToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '10d' })

      await createAuditLog({
        actorId: user.id,
        action: 'refresh_token',
        entity: 'User',
        entityId: user.id,
        summary: `Tokens de acesso renovados para o usuário "${user.name}".`,
        details: { email: user.email }
      })

      return { token, refreshToken: newRefreshToken }
    } catch {
      return manageError({ code: 'invalid_token' })
    }
  }
)