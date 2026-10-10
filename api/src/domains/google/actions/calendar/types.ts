import type { z } from 'zod'
import type {
  getCalendarAuthUrlResponseSchema,
  getCalendarAuthUrlQuerySchema,
  calendarCallbackQuerySchema,
  calendarStatusResponseSchema,
  disconnectCalendarBodySchema,
  disconnectCalendarResponseSchema,
  updateCalendarNameBodySchema,
  updateCalendarNameResponseSchema,
  recreateCalendarResponseSchema,
  calendarItemSchema,
  listCalendarsResponseSchema,
  updateSelectedCalendarsBodySchema,
  updateSelectedCalendarsResponseSchema
} from './schemas'

export type GetCalendarAuthUrlResponse = z.infer<typeof getCalendarAuthUrlResponseSchema>
export type GetCalendarAuthUrlQuery = z.infer<typeof getCalendarAuthUrlQuerySchema>
export type CalendarCallbackQuery = z.infer<typeof calendarCallbackQuerySchema>
export type CalendarStatusResponse = z.infer<typeof calendarStatusResponseSchema>
export type DisconnectCalendarBody = z.infer<typeof disconnectCalendarBodySchema>
export type DisconnectCalendarResponse = z.infer<typeof disconnectCalendarResponseSchema>
export type UpdateCalendarNameBody = z.infer<typeof updateCalendarNameBodySchema>
export type UpdateCalendarNameResponse = z.infer<typeof updateCalendarNameResponseSchema>
export type RecreateCalendarResponse = z.infer<typeof recreateCalendarResponseSchema>
export type CalendarListItem = z.infer<typeof calendarItemSchema>
export type ListCalendarsResponse = z.infer<typeof listCalendarsResponseSchema>
export type UpdateSelectedCalendarsBody = z.infer<typeof updateSelectedCalendarsBodySchema>
export type UpdateSelectedCalendarsResponse = z.infer<typeof updateSelectedCalendarsResponseSchema>

export interface GoogleOAuthStatePayload {
  userId: string
  action: 'calendar_sync'
  frontendUrl?: string
}
