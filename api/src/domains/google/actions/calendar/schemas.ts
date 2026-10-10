import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import registry from '@factories/docs/registry'

extendZodWithOpenApi(z)

export const getCalendarAuthUrlResponseSchema = registry.register(
  'GetCalendarAuthUrlResponse',
  z.object({
    url: z.string()
  })
)

export const getCalendarAuthUrlQuerySchema = registry.register(
  'GetCalendarAuthUrlQuery',
  z.object({
    origin: z.string().optional()
  })
)

export const calendarCallbackQuerySchema = registry.register(
  'CalendarCallbackQuery',
  z.object({
    code: z.string().optional(),
    state: z.string().optional(),
    error: z.string().optional()
  })
)

export const calendarStatusResponseSchema = registry.register(
  'CalendarStatusResponse',
  z.object({
    connected: z.boolean(),
    email: z.string().optional(),
    calendarId: z.string().optional(),
    calendarName: z.string().optional(),
    calendarUrl: z.string().optional(),
    calendarDeleted: z.boolean().optional(),
    connectedAt: z.date().optional()
  })
)

export const disconnectCalendarBodySchema = registry.register(
  'DisconnectCalendarBody',
  z.object({
    deleteCalendar: z.boolean().optional()
  })
)

export const disconnectCalendarResponseSchema = registry.register(
  'DisconnectCalendarResponse',
  z.object({
    success: z.boolean(),
    message: z.string()
  })
)

export const updateCalendarNameBodySchema = registry.register(
  'UpdateCalendarNameBody',
  z.object({
    name: z.string().min(1, 'O nome da agenda é obrigatório').max(100, 'O nome da agenda deve ter no máximo 100 caracteres')
  })
)

export const updateCalendarNameResponseSchema = registry.register(
  'UpdateCalendarNameResponse',
  z.object({
    success: z.boolean(),
    calendarName: z.string(),
    message: z.string()
  })
)

export const recreateCalendarResponseSchema = registry.register(
  'RecreateCalendarResponse',
  z.object({
    success: z.boolean(),
    calendarId: z.string(),
    calendarName: z.string(),
    calendarUrl: z.string(),
    message: z.string()
  })
)

export const calendarItemSchema = registry.register(
  'CalendarListItem',
  z.object({
    id: z.string(),
    summary: z.string(),
    description: z.string().optional(),
    primary: z.boolean().optional(),
    backgroundColor: z.string().optional(),
    foregroundColor: z.string().optional(),
    accessRole: z.string().optional(),
    isLabV2: z.boolean(),
    selected: z.boolean()
  })
)

export const listCalendarsResponseSchema = registry.register(
  'ListCalendarsResponse',
  z.object({
    connected: z.boolean(),
    items: z.array(calendarItemSchema),
    selectedCalendarIds: z.array(z.string())
  })
)

export const updateSelectedCalendarsBodySchema = registry.register(
  'UpdateSelectedCalendarsBody',
  z.object({
    calendarIds: z.array(z.string())
  })
)

export const updateSelectedCalendarsResponseSchema = registry.register(
  'UpdateSelectedCalendarsResponse',
  z.object({
    success: z.boolean(),
    selectedCalendarIds: z.array(z.string()),
    message: z.string()
  })
)

