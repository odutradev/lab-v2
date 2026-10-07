import jwt from 'jsonwebtoken'

import {
  getCalendarAuthUrlResponseSchema,
  calendarCallbackQuerySchema,
  calendarStatusResponseSchema,
  disconnectCalendarResponseSchema
} from '@domains/google/actions/calendar/schemas'
import {
  generateGoogleAuthUrl,
  exchangeCodeForTokens,
  fetchGoogleUserEmail,
  createAuthenticatedClient,
  revokeGoogleToken
} from '@google/utils'
import { errorResponseSchema } from '@domains/users/actions/validation/schemas'
import userRepository from '@domains/users/repositories/user'
import authMiddleware from '@domains/users/middlewares/auth'
import createLocalLogger from '@utils/localLogger'
import defineAction from '@factories/defineAction'
import createAuditLog from '@createAuditLog'

import type {
  GetCalendarAuthUrlResponse,
  CalendarCallbackQuery,
  CalendarStatusResponse,
  DisconnectCalendarResponse,
  GoogleOAuthStatePayload
} from '@domains/google/actions/calendar/types'

const logger = createLocalLogger('google-calendar-actions')

const getFrontendBaseUrl = (): string => {
  const corsOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter((o) => o && o !== '*')

  return corsOrigins[0] || 'http://localhost:8080'
}

export const getCalendarAuthUrlAction = defineAction<
  { body: unknown; params: unknown; query: unknown; response: GetCalendarAuthUrlResponse }
>(
  {
    method: 'get',
    path: '/google/calendar/auth-url',
    summary: 'Gera a URL de autorização OAuth para o Google Calendar',
    tags: ['Google'],
    middlewares: [authMiddleware],
    responses: {
      200: {
        description: 'URL de autorização gerada com sucesso',
        schema: getCalendarAuthUrlResponseSchema
      },
      401: {
        description: 'Não autorizado',
        schema: errorResponseSchema
      }
    }
  },
  async ({ ids, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const secret = process.env.JWT_SECRET as string
    const statePayload: GoogleOAuthStatePayload = {
      userId: ids.userId,
      action: 'calendar_sync'
    }

    const state = jwt.sign(statePayload, secret, { expiresIn: '15m' })
    const url = generateGoogleAuthUrl({ state })

    return { url }
  }
)

const handleOAuthCallback = async ({
  query,
  defaultExpress
}: {
  query: CalendarCallbackQuery
  defaultExpress: { req: unknown; res: import('express').Response }
}) => {
  const frontendUrl = getFrontendBaseUrl()
  const { code, state, error } = query

  if (error) {
    logger.error('Google OAuth callback returned error:', error)
    defaultExpress.res.redirect(`${frontendUrl}/profile?google=error&message=${encodeURIComponent(String(error))}`)
    return
  }

  if (!code || !state) {
    logger.error('Google OAuth callback missing code or state')
    defaultExpress.res.redirect(`${frontendUrl}/profile?google=missing_params`)
    return
  }

  let statePayload: GoogleOAuthStatePayload
  try {
    const secret = process.env.JWT_SECRET as string
    statePayload = jwt.verify(state, secret) as GoogleOAuthStatePayload
  } catch (err) {
    logger.error('Google OAuth callback invalid state:', err)
    defaultExpress.res.redirect(`${frontendUrl}/profile?google=invalid_state`)
    return
  }

  try {
    const tokens = await exchangeCodeForTokens(code)

    let googleEmail: string | undefined
    if (tokens.refresh_token) {
      const authClient = createAuthenticatedClient(tokens.refresh_token)
      googleEmail = await fetchGoogleUserEmail(authClient)
    }

    await userRepository.updateGoogleCalendarIntegration(statePayload.userId, {
      connected: true,
      email: googleEmail,
      refreshToken: tokens.refresh_token || undefined,
      connectedAt: new Date()
    })

    await createAuditLog({
      actorId: statePayload.userId,
      action: 'google_calendar_connected',
      entity: 'integrations',
      entityId: statePayload.userId,
      summary: `Google Calendar conectado (${googleEmail || 'email não identificado'})`
    })

    defaultExpress.res.redirect(`${frontendUrl}/profile?google=connected`)
  } catch (err) {
    logger.error('Error exchanging code for tokens in Google callback:', err)
    defaultExpress.res.redirect(`${frontendUrl}/profile?google=token_exchange_failed`)
  }
}

export const calendarCallbackAction = defineAction<
  { body: unknown; params: unknown; query: CalendarCallbackQuery; response: void }
>(
  {
    method: 'get',
    path: '/google/calendar/callback',
    summary: 'Callback de autorização do Google Calendar',
    tags: ['Google'],
    schema: { query: calendarCallbackQuerySchema },
    responses: {
      302: {
        description: 'Redirecionamento para o frontend com status da operação'
      }
    }
  },
  async ({ query, defaultExpress }) => {
    await handleOAuthCallback({ query, defaultExpress })
  }
)

export const authGoogleCallbackAction = defineAction<
  { body: unknown; params: unknown; query: CalendarCallbackQuery; response: void }
>(
  {
    method: 'get',
    path: '/api/v1/auth/google/callback',
    summary: 'Callback do Google OAuth mapeado para redirect URI padrão',
    tags: ['Google'],
    schema: { query: calendarCallbackQuerySchema },
    responses: {
      302: {
        description: 'Redirecionamento para o frontend com status da operação'
      }
    }
  },
  async ({ query, defaultExpress }) => {
    await handleOAuthCallback({ query, defaultExpress })
  }
)

export const getCalendarStatusAction = defineAction<
  { body: unknown; params: unknown; query: unknown; response: CalendarStatusResponse }
>(
  {
    method: 'get',
    path: '/google/calendar/status',
    summary: 'Obtém o status da integração com o Google Calendar',
    tags: ['Google'],
    middlewares: [authMiddleware],
    responses: {
      200: {
        description: 'Status da integração retornado com sucesso',
        schema: calendarStatusResponseSchema
      },
      401: {
        description: 'Não autorizado',
        schema: errorResponseSchema
      }
    }
  },
  async ({ ids, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const user = await userRepository.findById(ids.userId)
    if (!user) return manageError({ code: 'user_not_found' })

    const calendarIntegration = user.integrations?.googleCalendar

    return {
      connected: !!calendarIntegration?.connected,
      email: calendarIntegration?.email,
      connectedAt: calendarIntegration?.connectedAt
    }
  }
)

export const disconnectCalendarAction = defineAction<
  { body: unknown; params: unknown; query: unknown; response: DisconnectCalendarResponse }
>(
  {
    method: 'post',
    path: '/google/calendar/disconnect',
    summary: 'Desvincula a integração com o Google Calendar',
    tags: ['Google'],
    middlewares: [authMiddleware],
    responses: {
      200: {
        description: 'Integração removida com sucesso',
        schema: disconnectCalendarResponseSchema
      },
      401: {
        description: 'Não autorizado',
        schema: errorResponseSchema
      }
    }
  },
  async ({ ids, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const userWithToken = await userRepository.findWithGoogleCalendarRefreshToken(ids.userId)
    const refreshToken = userWithToken?.integrations?.googleCalendar?.refreshToken

    if (refreshToken) {
      await revokeGoogleToken(refreshToken)
    }

    await userRepository.updateGoogleCalendarIntegration(ids.userId, {
      connected: false,
      email: undefined,
      refreshToken: undefined,
      connectedAt: undefined
    })

    await createAuditLog({
      actorId: ids.userId,
      action: 'google_calendar_disconnected',
      entity: 'integrations',
      entityId: ids.userId,
      summary: 'Google Calendar desconectado'
    })

    return {
      success: true,
      message: 'Google Agenda desvinculada com sucesso'
    }
  }
)
