import challengeRepository from '@domains/challenges/repositories/challenge'
import authMiddlewareWithDocs from '@domains/users/middlewares/auth'
import { isValidObjectId } from '@database/utils'
import defineAction from '@factories/defineAction'
import createAuditLog from '@createAuditLog'

import {
  createChallengeBodySchema,
  updateChallengeParamsSchema,
  updateChallengeBodySchema,
  removeChallengeParamsSchema,
  checkinChallengeParamsSchema,
  checkinChallengeBodySchema,
  checkinChallengeResponseSchema,
  slipChallengeParamsSchema,
  slipChallengeBodySchema,
  listChallengesQuerySchema,
  challengeResponseSchema,
  listChallengesResponseSchema,
  challengeActionSuccessResponseSchema,
  freezeChallengeParamsSchema,
  freezeChallengeBodySchema,
  freezeChallengeResponseSchema
} from './schemas'

import type {
  CreateChallengeBody,
  UpdateChallengeParams,
  UpdateChallengeBody,
  RemoveChallengeParams,
  CheckinChallengeParams,
  CheckinChallengeBody,
  SlipChallengeParams,
  SlipChallengeBody,
  ListChallengesQuery,
  FreezeChallengeParams,
  FreezeChallengeBody
} from './types'

const getTodayDateString = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const createChallengeAction = defineAction(
  {
    method: 'post',
    path: '/challenges/create',
    summary: 'Cria um novo desafio de constância (streak target)',
    tags: ['Challenges'],
    authenticate: true,
    schema: {
      body: createChallengeBodySchema
    },
    responses: {
      200: {
        description: 'Desafio criado com sucesso',
        schema: challengeResponseSchema
      }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const payload = data as CreateChallengeBody

    const created = await challengeRepository.create({
      userId: ids.userId,
      title: payload.title,
      description: payload.description,
      motivation: payload.motivation,
      emoji: payload.emoji,
      targetDays: payload.targetDays,
      startDate: payload.startDate,
      type: payload.type,
      resetOnMiss: payload.resetOnMiss,
      freezeDaysPerMonth: payload.freezeDaysPerMonth
    })

    await createAuditLog({
      actorId: ids.userId,
      action: 'create_challenge',
      entity: 'Challenge',
      entityId: created.id,
      summary: 'Desafio de constância criado pelo usuário.',
      details: { title: payload.title, targetDays: payload.targetDays, type: payload.type }
    })

    return created
  }
)

export const listChallengesAction = defineAction(
  {
    method: 'get',
    path: '/challenges/list',
    summary: 'Lista os desafios de constância do usuário autenticado',
    tags: ['Challenges'],
    authenticate: true,
    schema: {
      query: listChallengesQuerySchema
    },
    responses: {
      200: {
        description: 'Lista de desafios',
        schema: listChallengesResponseSchema
      }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, query, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const parsedQuery = (query || {}) as ListChallengesQuery
    const challenges = await challengeRepository.findAllByUser(ids.userId, parsedQuery)

    return challenges
  }
)

export const updateChallengeAction = defineAction(
  {
    method: 'patch',
    path: '/challenges/:id/update',
    summary: 'Atualiza dados de um desafio de constância',
    tags: ['Challenges'],
    authenticate: true,
    schema: {
      params: updateChallengeParamsSchema,
      body: updateChallengeBodySchema
    },
    responses: {
      200: {
        description: 'Desafio atualizado com sucesso',
        schema: challengeResponseSchema
      },
      404: {
        description: 'Desafio não encontrado'
      }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, params, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { id } = params as UpdateChallengeParams
    if (!isValidObjectId(id)) return manageError({ code: 'bad_request' })

    const updatePayload = data as UpdateChallengeBody
    const updated = await challengeRepository.update(id, ids.userId, updatePayload)
    if (!updated) return manageError({ code: 'not_found' })

    await createAuditLog({
      actorId: ids.userId,
      action: 'update_challenge',
      entity: 'Challenge',
      entityId: id,
      summary: 'Desafio atualizado pelo usuário.',
      details: updatePayload
    })

    return updated
  }
)

export const removeChallengeAction = defineAction(
  {
    method: 'delete',
    path: '/challenges/:id/remove',
    summary: 'Remove um desafio de constância',
    tags: ['Challenges'],
    authenticate: true,
    schema: {
      params: removeChallengeParamsSchema
    },
    responses: {
      200: {
        description: 'Desafio removido com sucesso',
        schema: challengeActionSuccessResponseSchema
      },
      404: {
        description: 'Desafio não encontrado'
      }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, params, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { id } = params as RemoveChallengeParams
    if (!isValidObjectId(id)) return manageError({ code: 'bad_request' })

    const removed = await challengeRepository.delete(id, ids.userId)
    if (!removed) return manageError({ code: 'not_found' })

    await createAuditLog({
      actorId: ids.userId,
      action: 'remove_challenge',
      entity: 'Challenge',
      entityId: id,
      summary: 'Desafio removido pelo usuário.'
    })

    return { success: true }
  }
)

export const checkinChallengeAction = defineAction(
  {
    method: 'post',
    path: '/challenges/:id/checkin',
    summary: 'Alterna o check-in diário de um desafio de constância',
    tags: ['Challenges'],
    authenticate: true,
    schema: {
      params: checkinChallengeParamsSchema,
      body: checkinChallengeBodySchema
    },
    responses: {
      200: {
        description: 'Checkin atualizado com sucesso',
        schema: checkinChallengeResponseSchema
      },
      404: {
        description: 'Desafio não encontrado'
      }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, params, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { id } = params as CheckinChallengeParams
    if (!isValidObjectId(id)) return manageError({ code: 'bad_request' })

    const body = (data || {}) as CheckinChallengeBody
    const targetDate = body.date || getTodayDateString()

    const { challenge, completedToday } = await challengeRepository.toggleCheckin(id, ids.userId, targetDate)
    if (!challenge) return manageError({ code: 'not_found' })

    await createAuditLog({
      actorId: ids.userId,
      action: 'checkin_challenge',
      entity: 'Challenge',
      entityId: id,
      summary: completedToday ? 'Check-in confirmado no desafio.' : 'Check-in desmarcado no desafio.',
      details: { date: targetDate, completedToday, totalCheckins: challenge.checkins.length }
    })

    return {
      challenge,
      completedToday
    }
  }
)

export const slipChallengeAction = defineAction(
  {
    method: 'post',
    path: '/challenges/:id/slip',
    summary: 'Registra um deslize em um desafio de constância',
    tags: ['Challenges'],
    authenticate: true,
    schema: {
      params: slipChallengeParamsSchema,
      body: slipChallengeBodySchema
    },
    responses: {
      200: {
        description: 'Deslize registrado com sucesso',
        schema: challengeResponseSchema
      },
      404: {
        description: 'Desafio não encontrado'
      }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, params, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { id } = params as SlipChallengeParams
    if (!isValidObjectId(id)) return manageError({ code: 'bad_request' })

    const body = (data || {}) as SlipChallengeBody
    const targetDate = body.date || getTodayDateString()

    const updated = await challengeRepository.recordSlip(
      id,
      ids.userId,
      targetDate,
      Boolean(body.resetCheckins)
    )
    if (!updated) return manageError({ code: 'not_found' })

    await createAuditLog({
      actorId: ids.userId,
      action: 'slip_challenge',
      entity: 'Challenge',
      entityId: id,
      summary: 'Deslize registrado no desafio.',
      details: { date: targetDate, resetCheckins: body.resetCheckins }
    })

    return updated
  }
)

export const freezeChallengeAction = defineAction(
  {
    method: 'post',
    path: '/challenges/:id/freeze',
    summary: 'Congela ou descongela um dia no desafio (streak freeze)',
    tags: ['Challenges'],
    authenticate: true,
    schema: {
      params: freezeChallengeParamsSchema,
      body: freezeChallengeBodySchema
    },
    responses: {
      200: {
        description: 'Status de congelamento do dia atualizado',
        schema: freezeChallengeResponseSchema
      },
      404: {
        description: 'Desafio não encontrado'
      }
    },
    middlewares: [authMiddlewareWithDocs]
  },
  async ({ ids, params, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const { id } = params as FreezeChallengeParams
    if (!isValidObjectId(id)) return manageError({ code: 'bad_request' })

    const body = (data || {}) as FreezeChallengeBody
    const targetDate = body.date || getTodayDateString()

    const { challenge, frozen, error } = await challengeRepository.toggleFreeze(id, ids.userId, targetDate)
    if (!challenge) return manageError({ code: 'not_found' })

    await createAuditLog({
      actorId: ids.userId,
      action: 'freeze_challenge',
      entity: 'Challenge',
      entityId: id,
      summary: frozen ? 'Dia congelado com sucesso (streak freeze).' : 'Dia descongelado no desafio.',
      details: { date: targetDate, frozen, error }
    })

    return {
      challenge,
      frozen,
      error
    }
  }
)

