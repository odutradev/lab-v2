import type { z } from 'zod'
import type {
  getCalendarAuthUrlResponseSchema,
  calendarCallbackQuerySchema,
  calendarStatusResponseSchema,
  disconnectCalendarBodySchema,
  disconnectCalendarResponseSchema,
  updateCalendarNameBodySchema,
  updateCalendarNameResponseSchema,
  recreateCalendarResponseSchema
} from './schemas'

export type GetCalendarAuthUrlResponse = z.infer<typeof getCalendarAuthUrlResponseSchema>
export type CalendarCallbackQuery = z.infer<typeof calendarCallbackQuerySchema>
export type CalendarStatusResponse = z.infer<typeof calendarStatusResponseSchema>
export type DisconnectCalendarBody = z.infer<typeof disconnectCalendarBodySchema>
export type DisconnectCalendarResponse = z.infer<typeof disconnectCalendarResponseSchema>
export type UpdateCalendarNameBody = z.infer<typeof updateCalendarNameBodySchema>
export type UpdateCalendarNameResponse = z.infer<typeof updateCalendarNameResponseSchema>
export type RecreateCalendarResponse = z.infer<typeof recreateCalendarResponseSchema>

export interface GoogleOAuthStatePayload {
  userId: string
  action: 'calendar_sync'
}
