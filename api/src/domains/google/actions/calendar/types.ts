import type { z } from 'zod'
import type {
  getCalendarAuthUrlResponseSchema,
  calendarCallbackQuerySchema,
  calendarStatusResponseSchema,
  disconnectCalendarResponseSchema
} from './schemas'

export type GetCalendarAuthUrlResponse = z.infer<typeof getCalendarAuthUrlResponseSchema>
export type CalendarCallbackQuery = z.infer<typeof calendarCallbackQuerySchema>
export type CalendarStatusResponse = z.infer<typeof calendarStatusResponseSchema>
export type DisconnectCalendarResponse = z.infer<typeof disconnectCalendarResponseSchema>

export interface GoogleOAuthStatePayload {
  userId: string
  action: 'calendar_sync'
}
