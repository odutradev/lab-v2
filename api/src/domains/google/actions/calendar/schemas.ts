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
    connectedAt: z.date().optional()
  })
)

export const disconnectCalendarResponseSchema = registry.register(
  'DisconnectCalendarResponse',
  z.object({
    success: z.boolean(),
    message: z.string()
  })
)
