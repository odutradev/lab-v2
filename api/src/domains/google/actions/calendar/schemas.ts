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

