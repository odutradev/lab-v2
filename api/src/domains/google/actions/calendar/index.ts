import jwt from 'jsonwebtoken'

import {
  getCalendarAuthUrlResponseSchema,
  getCalendarAuthUrlQuerySchema,
  calendarCallbackQuerySchema,
  calendarStatusResponseSchema,
  disconnectCalendarBodySchema,
  disconnectCalendarResponseSchema,
  updateCalendarNameBodySchema,
  updateCalendarNameResponseSchema,
  recreateCalendarResponseSchema,
  listCalendarsResponseSchema,
  updateSelectedCalendarsBodySchema,
  updateSelectedCalendarsResponseSchema
} from '@domains/google/actions/calendar/schemas'
import {
  generateGoogleAuthUrl,
  exchangeCodeForTokens,
  fetchGoogleUserEmail,
  createAuthenticatedClient,
  revokeGoogleToken,
  getOrCreateLabCalendar,
  updateGoogleCalendarSummary,
  deleteGoogleCalendar,
  checkGoogleCalendarStatus,
  listUserGoogleCalendars
} from '@google/utils'
import { errorResponseSchema } from '@domains/users/actions/validation/schemas'
import { syncAllUserHabitsToGoogle } from '@domains/habits/utils/googleSync'
import userRepository from '@domains/users/repositories/user'
import authMiddleware from '@domains/users/middlewares/auth'
import createLocalLogger from '@utils/localLogger'
import defineAction from '@factories/defineAction'
import createAuditLog from '@createAuditLog'

import type {
  GetCalendarAuthUrlResponse,
  GetCalendarAuthUrlQuery,
  CalendarCallbackQuery,
  CalendarStatusResponse,
  DisconnectCalendarBody,
  DisconnectCalendarResponse,
  UpdateCalendarNameBody,
  UpdateCalendarNameResponse,
  RecreateCalendarResponse,
  ListCalendarsResponse,
  UpdateSelectedCalendarsBody,
  UpdateSelectedCalendarsResponse,
  GoogleOAuthStatePayload
} from '@domains/google/actions/calendar/types'

const logger = createLocalLogger('google-calendar-actions')

const getFrontendBaseUrl = (): string => {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL.replace(/\/$/, '')
  }

  const corsOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter((o) => o && o !== '*')

  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.PRODUCTION === 'true'

  if (isProduction) {
    const prodOrigin = corsOrigins.find((o) => !o.includes('localhost') && !o.includes('127.0.0.1'))
    if (prodOrigin) return prodOrigin
  }

  return corsOrigins[0] || 'http://localhost:8080'
}

export const getCalendarAuthUrlAction = defineAction<
  { body: unknown; params: unknown; query: GetCalendarAuthUrlQuery; response: GetCalendarAuthUrlResponse },
  any,
  any,
  { userId: string }
>(
  {
    method: 'get',
    path: '/google/calendar/auth-url',
    summary: 'Gera a URL de autorização OAuth para o Google Calendar',
    tags: ['Google'],
    middlewares: [authMiddleware],
    schema: {
      query: getCalendarAuthUrlQuerySchema
    },
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
  async ({ ids, query, defaultExpress, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const originHeader = defaultExpress?.req?.headers?.origin as string | undefined
    const refererHeader = defaultExpress?.req?.headers?.referer as string | undefined

    let clientOrigin: string | undefined

    if (query?.origin) {
      clientOrigin = query.origin.trim().replace(/\/$/, '')
    } else if (originHeader) {
      clientOrigin = originHeader.trim().replace(/\/$/, '')
    } else if (refererHeader) {
      try {
        const parsed = new URL(refererHeader)
        clientOrigin = parsed.origin
      } catch {}
    }

    const secret = process.env.JWT_SECRET as string
    const statePayload: GoogleOAuthStatePayload = {
      userId: ids.userId,
      action: 'calendar_sync',
      frontendUrl: clientOrigin
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
  const fallbackFrontendUrl = getFrontendBaseUrl()
  const { code, state, error } = query

  let statePayload: GoogleOAuthStatePayload | undefined
  if (state) {
    try {
      const secret = process.env.JWT_SECRET as string
      statePayload = jwt.verify(state, secret) as GoogleOAuthStatePayload
    } catch (err) {
      logger.error('Google OAuth callback invalid state:', err)
      defaultExpress.res.redirect(`${fallbackFrontendUrl}/profile?google=invalid_state`)
      return
    }
  }

  const frontendUrl = statePayload?.frontendUrl || fallbackFrontendUrl

  if (error) {
    logger.error('Google OAuth callback returned error:', error)
    defaultExpress.res.redirect(`${frontendUrl}/profile?google=error&message=${encodeURIComponent(String(error))}`)
    return
  }

  if (!code || !statePayload) {
    logger.error('Google OAuth callback missing code or state')
    defaultExpress.res.redirect(`${frontendUrl}/profile?google=missing_params`)
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

    if (statePayload.userId) {
      await syncAllUserHabitsToGoogle(statePayload.userId)
    }

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
    let calendarName = calendarIntegration?.calendarName || (isConnected ? 'Lab V2' : undefined)
    let calendarDeleted = false

    if (isConnected && calendarId) {
      const userWithToken = await userRepository.findWithGoogleCalendarRefreshToken(ids.userId)
      const refreshToken = userWithToken?.integrations?.googleCalendar?.refreshToken

      if (refreshToken) {
        const syncStatus = await checkGoogleCalendarStatus(refreshToken, calendarId)
        if (!syncStatus.exists) {
          calendarDeleted = true
        } else if (syncStatus.summary && syncStatus.summary !== calendarName) {
          calendarName = syncStatus.summary
          await userRepository.updateGoogleCalendarName(ids.userId, calendarName)
        }
      }
    }

    const calendarUrl = isConnected && calendarId && !calendarDeleted
      ? `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(calendarId)}`
      : undefined

    return {
      connected: isConnected,
      email: calendarIntegration?.email,
      calendarId,
      calendarName,
      calendarUrl,
      calendarDeleted,
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
  async ({ ids, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const payload = data as DisconnectCalendarBody | undefined
    const userWithToken = await userRepository.findWithGoogleCalendarRefreshToken(ids.userId)
    const refreshToken = userWithToken?.integrations?.googleCalendar?.refreshToken
    const calendarId = userWithToken?.integrations?.googleCalendar?.calendarId
    const shouldDelete = !!payload?.deleteCalendar
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
  async ({ ids, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const payload = data as UpdateCalendarNameBody | undefined
    if (!payload?.name?.trim()) {
      return manageError({ code: 'bad_request', message: 'O nome da agenda é obrigatório' })
    }

    const userWithToken = await userRepository.findWithGoogleCalendarRefreshToken(ids.userId)
    if (!userWithToken?.integrations?.googleCalendar?.connected || !userWithToken.integrations.googleCalendar.calendarId) {
      return manageError({ code: 'bad_request', message: 'Nenhuma agenda do Google vinculada para renomear' })
    }

    const { refreshToken, calendarId } = userWithToken.integrations.googleCalendar
    const newName = payload.name.trim()

    let updatedSummary = newName
    if (refreshToken) {
      try {
        updatedSummary = await updateGoogleCalendarSummary(refreshToken, calendarId, newName)
      } catch (error) {
        logger.error('Error updating Google Calendar name on Google API:', error)
        return manageError({
          code: 'bad_request',
          message: 'Não foi possível alterar o nome da agenda no Google Calendar'
        })
      }
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

export const recreateCalendarAction = defineAction<
  { body: unknown; params: unknown; query: unknown; response: RecreateCalendarResponse }
>(
  {
    method: 'post',
    path: '/google/calendar/recreate',
    summary: 'Recria ou restaura a agenda no Google Calendar para o usuário',
    tags: ['Google'],
    middlewares: [authMiddleware],
    responses: {
      200: {
        description: 'Agenda recriada com sucesso',
        schema: recreateCalendarResponseSchema
      },
      400: {
        description: 'Requisição inválida ou token ausente',
        schema: errorResponseSchema
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

    if (!userWithToken?.integrations?.googleCalendar?.connected || !refreshToken) {
      return manageError({ code: 'bad_request', message: 'Google Agenda não está conectada ou sem autorização' })
    }

    const desiredName = userWithToken.integrations.googleCalendar.calendarName || 'Lab V2'
    const newCalendar = await getOrCreateLabCalendar(refreshToken, desiredName)

    await userRepository.updateGoogleCalendarIntegration(ids.userId, {
      connected: true,
      email: userWithToken.integrations.googleCalendar.email,
      refreshToken,
      calendarId: newCalendar.id,
      calendarName: newCalendar.summary,
      connectedAt: new Date()
    })

    await createAuditLog({
      actorId: ids.userId,
      action: 'google_calendar_recreated',
      entity: 'integrations',
      entityId: ids.userId,
      summary: `Agenda Google Calendar recriada com sucesso: "${newCalendar.summary}" (${newCalendar.id})`
    })

    await syncAllUserHabitsToGoogle(ids.userId)

    const calendarUrl = `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(newCalendar.id)}`

    return {
      success: true,
      calendarId: newCalendar.id,
      calendarName: newCalendar.summary,
      calendarUrl,
      message: 'Agenda recriada com sucesso no Google Calendar'
    }
  }
)

export const listCalendarsAction = defineAction<
  { body: unknown; params: unknown; query: unknown; response: ListCalendarsResponse }
>(
  {
    method: 'get',
    path: '/google/calendar/list',
    summary: 'Lista todas as agendas da conta do Google Calendar do usuário e status de seleção',
    tags: ['Google'],
    middlewares: [authMiddleware],
    responses: {
      200: {
        description: 'Lista de agendas retornada com sucesso',
        schema: listCalendarsResponseSchema
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
    const isConnected = !!userWithToken?.integrations?.googleCalendar?.connected
    const refreshToken = userWithToken?.integrations?.googleCalendar?.refreshToken
    const labCalendarId = userWithToken?.integrations?.googleCalendar?.calendarId
    const labCalendarName = userWithToken?.integrations?.googleCalendar?.calendarName || 'Lab V2'
    const storedSelectedIds = userWithToken?.integrations?.googleCalendar?.selectedCalendarIds || []

    if (!isConnected || !refreshToken) {
      return {
        connected: false,
        items: [],
        selectedCalendarIds: storedSelectedIds
      }
    }

    try {
      const gcalItems = await listUserGoogleCalendars(refreshToken)
      const normalizedLabName = labCalendarName.trim().toLowerCase()

      const items = gcalItems.map((item) => {
        const isLabV2 = Boolean(
          (labCalendarId && item.id === labCalendarId) ||
          item.summary.trim().toLowerCase() === normalizedLabName
        )
        const selected = isLabV2 || storedSelectedIds.includes(item.id)

        return {
          id: item.id,
          summary: item.summary,
          description: item.description,
          primary: item.primary,
          backgroundColor: item.backgroundColor,
          foregroundColor: item.foregroundColor,
          accessRole: item.accessRole,
          isLabV2,
          selected
        }
      })

      return {
        connected: true,
        items,
        selectedCalendarIds: storedSelectedIds
      }
    } catch (err) {
      logger.error('Failed to list user google calendars:', err)
      return {
        connected: true,
        items: [],
        selectedCalendarIds: storedSelectedIds
      }
    }
  }
)

export const updateSelectedCalendarsAction = defineAction<
  { body: UpdateSelectedCalendarsBody; params: unknown; query: unknown; response: UpdateSelectedCalendarsResponse }
>(
  {
    method: 'put',
    path: '/google/calendar/selected',
    summary: 'Atualiza quais agendas devem ser exibidas no calendário',
    tags: ['Google'],
    middlewares: [authMiddleware],
    schema: {
      body: updateSelectedCalendarsBodySchema
    },
    responses: {
      200: {
        description: 'Preferências de agendas atualizadas com sucesso',
        schema: updateSelectedCalendarsResponseSchema
      },
      401: {
        description: 'Não autorizado',
        schema: errorResponseSchema
      }
    }
  },
  async ({ ids, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const calendarIds = Array.isArray(data?.calendarIds) ? data.calendarIds : []
    await userRepository.updateGoogleCalendarSelectedIds(ids.userId, calendarIds)

    return {
      success: true,
      selectedCalendarIds: calendarIds,
      message: 'Agendas visíveis atualizadas com sucesso'
    }
  }
)

