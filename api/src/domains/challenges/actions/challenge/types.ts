import type { z } from 'zod'
import type {
  createChallengeBodySchema,
  updateChallengeParamsSchema,
  updateChallengeBodySchema,
  removeChallengeParamsSchema,
  checkinChallengeParamsSchema,
  checkinChallengeBodySchema,
  slipChallengeParamsSchema,
  slipChallengeBodySchema,
  listChallengesQuerySchema,
  freezeChallengeParamsSchema,
  freezeChallengeBodySchema,
  freezeChallengeResponseSchema
} from './schemas'

export type CreateChallengeBody = z.infer<typeof createChallengeBodySchema>
export type UpdateChallengeParams = z.infer<typeof updateChallengeParamsSchema>
export type UpdateChallengeBody = z.infer<typeof updateChallengeBodySchema>
export type RemoveChallengeParams = z.infer<typeof removeChallengeParamsSchema>
export type CheckinChallengeParams = z.infer<typeof checkinChallengeParamsSchema>
export type CheckinChallengeBody = z.infer<typeof checkinChallengeBodySchema>
export type SlipChallengeParams = z.infer<typeof slipChallengeParamsSchema>
export type SlipChallengeBody = z.infer<typeof slipChallengeBodySchema>
export type ListChallengesQuery = z.infer<typeof listChallengesQuerySchema>
export type FreezeChallengeParams = z.infer<typeof freezeChallengeParamsSchema>
export type FreezeChallengeBody = z.infer<typeof freezeChallengeBodySchema>
export type FreezeChallengeResponse = z.infer<typeof freezeChallengeResponseSchema>
