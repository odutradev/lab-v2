import type { diaryQuerySchema, createDiaryEntryBodySchema, logPlanMealBodySchema, diaryEntryParamsSchema } from './schemas'
import type { z } from 'zod'

export type DiaryQuery = z.infer<typeof diaryQuerySchema>
export type CreateDiaryEntryBody = z.infer<typeof createDiaryEntryBodySchema>
export type LogPlanMealBody = z.infer<typeof logPlanMealBodySchema>
export type DiaryEntryParams = z.infer<typeof diaryEntryParamsSchema>
