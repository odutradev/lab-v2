import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import registry from '@factories/docs/registry'

extendZodWithOpenApi(z)

export const challengeChecklistItemSchema = registry.register(
  'ChallengeChecklistItem',
  z.object({
    id: z.string(),
    text: z.string().min(1, 'Texto do item é obrigatório').max(200),
    completed: z.boolean().default(false)
  })
)

export const challengeResponseSchema = registry.register(
  'ChallengeResponse',
  z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    description: z.string().optional(),
    motivation: z.string().optional(),
    notes: z.string().optional(),
    checklist: z.array(challengeChecklistItemSchema).optional(),
    emoji: z.string(),
    targetDays: z.number(),
    startDate: z.string(),
    checkins: z.array(z.string()),
    status: z.enum(['active', 'completed', 'paused']),
    type: z.enum(['streak', 'accumulative']),
    resetOnMiss: z.boolean(),
    slipDates: z.array(z.string()).optional(),
    freezeDaysPerMonth: z.number().default(2),
    freezeDates: z.array(z.string()).optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional()
  })
)

export const listChallengesResponseSchema = registry.register(
  'ListChallengesResponse',
  z.array(challengeResponseSchema)
)

export const createChallengeBodySchema = registry.register(
  'CreateChallengeBody',
  z.object({
    title: z.string().min(1, 'Título é obrigatório').max(120),
    description: z.string().max(500).optional(),
    motivation: z.string().max(500).optional(),
    notes: z.string().max(2000).optional(),
    checklist: z.array(challengeChecklistItemSchema).optional(),
    emoji: z.string().max(10).optional(),
    targetDays: z.number().int().min(1, 'Meta mínima de 1 dia').max(3650),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inicial deve seguir o formato YYYY-MM-DD').optional(),
    type: z.enum(['streak', 'accumulative']).optional(),
    resetOnMiss: z.boolean().optional(),
    freezeDaysPerMonth: z.number().int().min(0).max(7).optional()
  })
)

export const updateChallengeParamsSchema = registry.register(
  'UpdateChallengeParams',
  z.object({
    id: z.string().min(1, 'ID do desafio é obrigatório')
  })
)

export const updateChallengeBodySchema = registry.register(
  'UpdateChallengeBody',
  z.object({
    title: z.string().min(1).max(120).optional(),
    description: z.string().max(500).optional(),
    motivation: z.string().max(500).optional(),
    notes: z.string().max(2000).optional(),
    checklist: z.array(challengeChecklistItemSchema).optional(),
    emoji: z.string().max(10).optional(),
    targetDays: z.number().int().min(1).max(3650).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    status: z.enum(['active', 'completed', 'paused']).optional(),
    type: z.enum(['streak', 'accumulative']).optional(),
    resetOnMiss: z.boolean().optional(),
    freezeDaysPerMonth: z.number().int().min(0).max(7).optional()
  })
)

export const removeChallengeParamsSchema = registry.register(
  'RemoveChallengeParams',
  z.object({
    id: z.string().min(1, 'ID do desafio é obrigatório')
  })
)

export const checkinChallengeParamsSchema = registry.register(
  'CheckinChallengeParams',
  z.object({
    id: z.string().min(1, 'ID do desafio é obrigatório')
  })
)

export const checkinChallengeBodySchema = registry.register(
  'CheckinChallengeBody',
  z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve seguir o formato YYYY-MM-DD').optional()
  })
)

export const checkinChallengeResponseSchema = registry.register(
  'CheckinChallengeResponse',
  z.object({
    challenge: challengeResponseSchema,
    completedToday: z.boolean()
  })
)

export const slipChallengeParamsSchema = registry.register(
  'SlipChallengeParams',
  z.object({
    id: z.string().min(1, 'ID do desafio é obrigatório')
  })
)

export const slipChallengeBodySchema = registry.register(
  'SlipChallengeBody',
  z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve seguir o formato YYYY-MM-DD').optional(),
    resetCheckins: z.boolean().optional()
  })
)

export const listChallengesQuerySchema = registry.register(
  'ListChallengesQuery',
  z.object({
    status: z.enum(['active', 'completed', 'paused']).optional()
  })
)

export const challengeActionSuccessResponseSchema = registry.register(
  'ChallengeActionSuccessResponse',
  z.object({
    success: z.boolean()
  })
)

export const freezeChallengeParamsSchema = registry.register(
  'FreezeChallengeParams',
  z.object({
    id: z.string().min(1, 'ID do desafio é obrigatório')
  })
)

export const freezeChallengeBodySchema = registry.register(
  'FreezeChallengeBody',
  z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve seguir o formato YYYY-MM-DD').optional()
  })
)

export const freezeChallengeResponseSchema = registry.register(
  'FreezeChallengeResponse',
  z.object({
    challenge: challengeResponseSchema,
    frozen: z.boolean(),
    error: z.string().optional()
  })
)
