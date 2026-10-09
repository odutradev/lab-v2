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
  listChallengesQuerySchema
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
