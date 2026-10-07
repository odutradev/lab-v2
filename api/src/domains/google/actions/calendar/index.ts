import jwt from 'jsonwebtoken'

import {
  getCalendarAuthUrlResponseSchema,
  calendarCallbackQuerySchema,
  calendarStatusResponseSchema,
  disconnectCalendarBodySchema,
  disconnectCalendarResponseSchema,
  updateCalendarNameBodySchema,
  updateCalendarNameResponseSchema
} from '@domains/google/actions/calendar/schemas'
import {
  generateGoogleAuthUrl,
  exchangeCodeForTokens,
  fetchGoogleUserEmail,
  createAuthenticatedClient,
  revokeGoogleToken,
  getOrCreateLabCalendar,
  updateGoogleCalendarSummary,
  deleteGoogleCalendar
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
  DisconnectCalendarBody,
  DisconnectCalendarResponse,
  UpdateCalendarNameBody,
  UpdateCalendarNameResponse,
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

    let refreshToken = tokens.refresh_token
    if (!refreshToken) {
      const existingUser = await userRepository.findWithGoogleCalendarRefreshToken(statePayload.userId)
      refreshToken = existingUser?.integrations?.googleCalendar?.refreshToken
    }

    let googleEmail: string | undefined
    let labCalendarId: string | undefined
    let labCalendarName: string | undefined

    if (refreshToken) {
      const authClient = createAuthenticatedClient(refreshToken)
      googleEmail = await fetchGoogleUserEmail(authClient)
      const calendarDetails = await getOrCreateLabCalendar(refreshToken)
      labCalendarId = calendarDetails.id
      labCalendarName = calendarDetails.summary
    }

    await userRepository.updateGoogleCalendarIntegration(statePayload.userId, {
      connected: true,
      email: googleEmail,
      refreshToken: refreshToken || undefined,
      calendarId: labCalendarId,
      calendarName: labCalendarName,
      connectedAt: new Date()
    })

    await createAuditLog({
      actorId: statePayload.userId,
      action: 'google_calendar_connected',
      entity: 'integrations',
      entityId: statePayload.userId,
      summary: `Google Calendar conectado (${googleEmail || 'email não identificado'}) com agenda "${labCalendarName || 'Lab V2'}" (${labCalendarId || 'id não gerado'})`
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
    const isConnected = !!calendarIntegration?.connected
    const calendarId = calendarIntegration?.calendarId

    const calendarUrl = isConnected && calendarId
      ? `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(calendarId)}`
      : undefined

    return {
      connected: isConnected,
      email: calendarIntegration?.email,
      calendarId,
      calendarName: calendarIntegration?.calendarName || (isConnected ? 'Lab V2' : undefined),
      calendarUrl,
      connectedAt: calendarIntegration?.connectedAt
    }
  }
)

export const disconnectCalendarAction = defineAction<
  { body?: DisconnectCalendarBody; params: unknown; query: unknown; response: DisconnectCalendarResponse }
>(
  {
    method: 'post',
    path: '/google/calendar/disconnect',
    summary: 'Desvincula a integração com o Google Calendar com opção de exclusão da agenda',
    tags: ['Google'],
    middlewares: [authMiddleware],
    schema: { body: disconnectCalendarBodySchema.optional() },
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
  async ({ ids, body, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const userWithToken = await userRepository.findWithGoogleCalendarRefreshToken(ids.userId)
    const refreshToken = userWithToken?.integrations?.googleCalendar?.refreshToken
    const calendarId = userWithToken?.integrations?.googleCalendar?.calendarId
    const shouldDelete = !!body?.deleteCalendar
    let calendarDeleted = false

    if (shouldDelete && refreshToken && calendarId) {
      const isPrimary = calendarId === 'primary' ||
        calendarId === userWithToken.email ||
        calendarId === userWithToken.integrations?.googleCalendar?.email

      if (!isPrimary) {
        calendarDeleted = await deleteGoogleCalendar(refreshToken, calendarId)
      }
    }

    if (refreshToken) {
      await revokeGoogleToken(refreshToken)
    }

    await userRepository.updateGoogleCalendarIntegration(ids.userId, {
      connected: false,
      email: undefined,
      refreshToken: undefined,
      calendarId: undefined,
      calendarName: undefined,
      connectedAt: undefined
    })

    await createAuditLog({
      actorId: ids.userId,
      action: 'google_calendar_disconnected',
      entity: 'integrations',
      entityId: ids.userId,
      summary: `Google Calendar desconectado${calendarDeleted ? ' e agenda excluída do Google Calendar' : ''}`
    })

    return {
      success: true,
      message: calendarDeleted
        ? 'Google Agenda desvinculada e excluída com sucesso do Google Calendar'
        : 'Google Agenda desvinculada com sucesso'
    }
  }
)

export const updateCalendarNameAction = defineAction<
  { body: UpdateCalendarNameBody; params: unknown; query: unknown; response: UpdateCalendarNameResponse }
>(
  {
    method: 'patch',
    path: '/google/calendar/name',
    summary: 'Atualiza o nome da agenda vinculada no Google Calendar',
    tags: ['Google'],
    middlewares: [authMiddleware],
    schema: { body: updateCalendarNameBodySchema },
    responses: {
      200: {
        description: 'Nome da agenda atualizado com sucesso',
        schema: updateCalendarNameResponseSchema
      },
      400: {
        description: 'Requisição inválida ou agenda não conectada',
        schema: errorResponseSchema
      },
      401: {
        description: 'Não autorizado',
        schema: errorResponseSchema
      }
    }
  },
  async ({ ids, body, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const userWithToken = await userRepository.findWithGoogleCalendarRefreshToken(ids.userId)
    if (!userWithToken?.integrations?.googleCalendar?.connected || !userWithToken.integrations.googleCalendar.calendarId) {
      return manageError({ code: 'bad_request', message: 'Nenhuma agenda do Google vinculada para renomear' })
    }

    const { refreshToken, calendarId } = userWithToken.integrations.googleCalendar
    const newName = body.name.trim()

    let updatedSummary = newName
    if (refreshToken) {
      updatedSummary = await updateGoogleCalendarSummary(refreshToken, calendarId, newName)
    }

    await userRepository.updateGoogleCalendarName(ids.userId, updatedSummary)

    await createAuditLog({
      actorId: ids.userId,
      action: 'google_calendar_renamed',
      entity: 'integrations',
      entityId: ids.userId,
      summary: `Nome da agenda do Google Calendar alterado para "${updatedSummary}"`
    })

    return {
      success: true,
      calendarName: updatedSummary,
      message: 'Nome da agenda atualizado com sucesso'
    }
  }
)
