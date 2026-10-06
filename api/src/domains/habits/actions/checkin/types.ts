import type { toggleCheckinBodySchema, toggleCheckinResponseSchema, daySummaryQuerySchema, daySummaryResponseSchema, daySummaryItemSchema } from '@domains/habits/actions/checkin/schemas'
import type { z } from 'zod'

export type ToggleCheckinBody = z.infer<typeof toggleCheckinBodySchema>
export type ToggleCheckinResponse = z.infer<typeof toggleCheckinResponseSchema>
export type DaySummaryQuery = z.infer<typeof daySummaryQuerySchema>
export type DaySummaryResponse = z.infer<typeof daySummaryResponseSchema>
export type DaySummaryItem = z.infer<typeof daySummaryItemSchema>
