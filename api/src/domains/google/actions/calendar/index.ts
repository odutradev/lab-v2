import jwt from 'jsonwebtoken'

import { getCalendarAuthUrlResponseSchema, getCalendarAuthUrlQuerySchema, calendarCallbackQuerySchema, calendarStatusResponseSchema, disconnectCalendarBodySchema, disconnectCalendarResponseSchema, updateCalendarNameBodySchema, updateCalendarNameResponseSchema, recreateCalendarResponseSchema, listCalendarsResponseSchema, updateSelectedCalendarsBodySchema, updateSelectedCalendarsResponseSchema } from './schemas'
import { generateGoogleAuthUrl, exchangeCodeForTokens, fetchGoogleUserEmail, createAuthenticatedClient, revokeGoogleToken, getOrCreateLabCalendar, updateGoogleCalendarSummary, deleteGoogleCalendar, checkGoogleCalendarStatus } from '@google/utils'
import { getCachedUserGoogleCalendars, invalidateAllUserGoogleCache, invalidateUserGoogleEvents } from '@google/cache'
import { syncAllUserHabitsToGoogle } from '@domains/habits/utils/googleSync'
import createAuditLog from '@domains/system/utils/createAuditLog'
import { errorResponseSchema } from '@factories/errors/schemas'
import userRepository from '@domains/users/repositories/user'
import authMiddleware from '@domains/users/middlewares/auth'
import createLocalLogger from '@utils/localLogger'
import defineAction from '@factories/defineAction'

import type { GetCalendarAuthUrlQuery, CalendarCallbackQuery, DisconnectCalendarBody, UpdateCalendarNameBody, UpdateSelectedCalendarsBody, GoogleOAuthStatePayload } from './types'
import type { DefaultExpressContext } from '@middlewares/manageRequest/types'

const logger = createLocalLogger('google-calendar-actions')

const DefaultCalendarName = 'Lab V2'

const removeTrailingSlash = (url: string): string => url.trim().replace(/\/$/, '')

const buildCalendarUrl = (calendarId: string): string => `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(calendarId)}`

const getFrontendBaseUrl = (): string => {
  if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL.replace(/\/$/, '')

  const corsOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter((origin) => origin && origin !== '*')

  const isProduction = process.env.NODE_ENV === 'production' || process.env.PRODUCTION === 'true'
  const productionOrigin = isProduction ? corsOrigins.find((origin) => !origin.includes('localhost') && !origin.includes('127.0.0.1')) : undefined

  return productionOrigin || corsOrigins[0] || 'http://localhost:8080'
}

const parseRefererOrigin = (referer: string): string | undefined => {
  try {
    return new URL(referer).origin
  } catch {
    return undefined
  }
}

const resolveClientOrigin = (query: GetCalendarAuthUrlQuery | undefined, originHeader?: string, refererHeader?: string): string | undefined => {
  if (query?.origin) return removeTrailingSlash(query.origin)
  if (originHeader) return removeTrailingSlash(originHeader)
  if (refererHeader) return parseRefererOrigin(refererHeader)
  return undefined
}

const verifyOAuthState = (state: string): GoogleOAuthStatePayload | null => {
  try {
    return jwt.verify(state, process.env.JWT_SECRET as string) as GoogleOAuthStatePayload
  } catch (error) {
    logger.error('Google OAuth callback invalid state:', error)
    return null
  }
}

const resolveRefreshToken = async (userId: string, receivedRefreshToken?: string | null): Promise<string | undefined> => {
  if (receivedRefreshToken) return receivedRefreshToken
  const existingUser = await userRepository.findWithGoogleCalendarRefreshToken(userId)
  return existingUser?.integrations?.googleCalendar?.refreshToken
}

const fetchCalendarConnectionDetails = async (refreshToken?: string) => {
  if (!refreshToken) return { googleEmail: undefined, labCalendarId: undefined, labCalendarName: undefined }

  const [googleEmail, calendarDetails] = await Promise.all([
    fetchGoogleUserEmail(createAuthenticatedClient(refreshToken)),
    getOrCreateLabCalendar(refreshToken)
  ])

  return { googleEmail, labCalendarId: calendarDetails.id, labCalendarName: calendarDetails.summary }
}

const handleOAuthCallback = async (query: CalendarCallbackQuery, defaultExpress: DefaultExpressContext): Promise<void> => {
  const fallbackFrontendUrl = getFrontendBaseUrl()
  const { code, state, error } = query
  const statePayload = state ? verifyOAuthState(state) : undefined

  if (statePayload === null) return defaultExpress.res.redirect(`${fallbackFrontendUrl}/profile?google=invalid_state`)

  const frontendUrl = statePayload?.frontendUrl || fallbackFrontendUrl

  if (error) {
    logger.error('Google OAuth callback returned error:', error)
    return defaultExpress.res.redirect(`${frontendUrl}/profile?google=error&message=${encodeURIComponent(String(error))}`)
  }

  if (!code || !statePayload) {
    logger.error('Google OAuth callback missing code or state')
    return defaultExpress.res.redirect(`${frontendUrl}/profile?google=missing_params`)
  }

  try {
    const tokens = await exchangeCodeForTokens(code)
    const refreshToken = await resolveRefreshToken(statePayload.userId, tokens.refresh_token)
    const { googleEmail, labCalendarId, labCalendarName } = await fetchCalendarConnectionDetails(refreshToken)

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
      summary: `Google Calendar conectado (${googleEmail || 'email não identificado'}) com agenda "${labCalendarName || DefaultCalendarName}" (${labCalendarId || 'id não gerado'})`
    })

    if (statePayload.userId) await syncAllUserHabitsToGoogle(statePayload.userId)

    defaultExpress.res.redirect(`${frontendUrl}/profile?google=connected`)
  } catch (exchangeError) {
    logger.error('Error exchanging code for tokens in Google callback:', exchangeError)
    defaultExpress.res.redirect(`${frontendUrl}/profile?google=token_exchange_failed`)
  }
}

const isPrimaryCalendar = (calendarId: string, userEmail?: string, googleEmail?: string): boolean => {
  return calendarId === 'primary' || calendarId === userEmail || calendarId === googleEmail
}

const resolveCalendarSync = async (userId: string, calendarId: string, currentName?: string) => {
  const userWithToken = await userRepository.findWithGoogleCalendarRefreshToken(userId)
  const refreshToken = userWithToken?.integrations?.googleCalendar?.refreshToken

  if (!refreshToken) return { calendarName: currentName, calendarDeleted: false }

  const syncStatus = await checkGoogleCalendarStatus(refreshToken, calendarId)

  if (!syncStatus.exists) return { calendarName: currentName, calendarDeleted: true }
  if (!syncStatus.summary || syncStatus.summary === currentName) return { calendarName: currentName, calendarDeleted: false }

  await userRepository.updateGoogleCalendarName(userId, syncStatus.summary)

  return { calendarName: syncStatus.summary, calendarDeleted: false }
}

const renameGoogleCalendar = async (refreshToken: string | undefined, calendarId: string, newName: string): Promise<string | null> => {
  if (!refreshToken) return newName

  try {
    return await updateGoogleCalendarSummary(refreshToken, calendarId, newName)
  } catch (error) {
    logger.error('Error updating Google Calendar name on Google API:', error)
    return null
  }
}

export const getCalendarAuthUrlAction = defineAction<{ query: GetCalendarAuthUrlQuery }>(
  {
    method: 'get',
    path: '/google/calendar/auth-url',
    summary: 'Gera a URL de autorização OAuth para o Google Calendar',
    tags: ['Google'],
    middlewares: [authMiddleware],
    schema: { query: getCalendarAuthUrlQuerySchema },
    responses: {
      200: { description: 'URL de autorização gerada com sucesso', schema: getCalendarAuthUrlResponseSchema },
      401: { description: 'Não autorizado', schema: errorResponseSchema }
    }
  },
  async ({ ids, query, defaultExpress, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const originHeader = defaultExpress?.req?.headers?.origin as string | undefined
    const refererHeader = defaultExpress?.req?.headers?.referer as string | undefined

    const statePayload: GoogleOAuthStatePayload = {
      userId: ids.userId,
      action: 'calendar_sync',
      frontendUrl: resolveClientOrigin(query, originHeader, refererHeader)
    }

    const state = jwt.sign(statePayload, process.env.JWT_SECRET as string, { expiresIn: '15m' })

    return { url: generateGoogleAuthUrl({ state }) }
  }
)

export const calendarCallbackAction = defineAction<{ query: CalendarCallbackQuery }>(
  {
    method: 'get',
    path: '/google/calendar/callback',
    summary: 'Callback de autorização do Google Calendar',
    tags: ['Google'],
    schema: { query: calendarCallbackQuerySchema },
    responses: {
      302: { description: 'Redirecionamento para o frontend com status da operação' }
    }
  },
  async ({ query, defaultExpress }) => handleOAuthCallback(query, defaultExpress)
)

export const authGoogleCallbackAction = defineAction<{ query: CalendarCallbackQuery }>(
  {
    method: 'get',
    path: '/api/v1/auth/google/callback',
    summary: 'Callback do Google OAuth mapeado para redirect URI padrão',
    tags: ['Google'],
    schema: { query: calendarCallbackQuerySchema },
    responses: {
      302: { description: 'Redirecionamento para o frontend com status da operação' }
    }
  },
  async ({ query, defaultExpress }) => handleOAuthCallback(query, defaultExpress)
)

export const getCalendarStatusAction = defineAction(
  {
    method: 'get',
    path: '/google/calendar/status',
    summary: 'Obtém o status da integração com o Google Calendar',
    tags: ['Google'],
    middlewares: [authMiddleware],
    responses: {
      200: { description: 'Status da integração retornado com sucesso', schema: calendarStatusResponseSchema },
      401: { description: 'Não autorizado', schema: errorResponseSchema }
    }
  },
  async ({ ids, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const user = await userRepository.findById(ids.userId)
    if (!user) return manageError({ code: 'user_not_found' })

    const calendarIntegration = user.integrations?.googleCalendar
    const isConnected = !!calendarIntegration?.connected
    const calendarId = calendarIntegration?.calendarId
    const storedCalendarName = calendarIntegration?.calendarName || (isConnected ? DefaultCalendarName : undefined)

    const { calendarName, calendarDeleted } = isConnected && calendarId
      ? await resolveCalendarSync(ids.userId, calendarId, storedCalendarName)
      : { calendarName: storedCalendarName, calendarDeleted: false }

    return {
      connected: isConnected,
      email: calendarIntegration?.email,
      calendarId,
      calendarName,
      calendarUrl: isConnected && calendarId && !calendarDeleted ? buildCalendarUrl(calendarId) : undefined,
      calendarDeleted,
      connectedAt: calendarIntegration?.connectedAt
    }
  }
)

export const disconnectCalendarAction = defineAction<{ body?: DisconnectCalendarBody }>(
  {
    method: 'post',
    path: '/google/calendar/disconnect',
    summary: 'Desvincula a integração com o Google Calendar com opção de exclusão da agenda',
    tags: ['Google'],
    middlewares: [authMiddleware],
    schema: { body: disconnectCalendarBodySchema.optional() },
    responses: {
      200: { description: 'Integração removida com sucesso', schema: disconnectCalendarResponseSchema },
      401: { description: 'Não autorizado', schema: errorResponseSchema }
    }
  },
  async ({ ids, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const userWithToken = await userRepository.findWithGoogleCalendarRefreshToken(ids.userId)
    const googleCalendar = userWithToken?.integrations?.googleCalendar
    const refreshToken = googleCalendar?.refreshToken
    const calendarId = googleCalendar?.calendarId
    const shouldDeleteCalendar = !!data?.deleteCalendar && !!refreshToken && !!calendarId && !isPrimaryCalendar(calendarId, userWithToken?.email, googleCalendar?.email)

    const calendarDeleted = shouldDeleteCalendar ? await deleteGoogleCalendar(refreshToken as string, calendarId as string) : false

    if (refreshToken) await revokeGoogleToken(refreshToken)

    await userRepository.updateGoogleCalendarIntegration(ids.userId, {
      connected: false,
      email: undefined,
      refreshToken: undefined,
      calendarId: undefined,
      calendarName: undefined,
      connectedAt: undefined
    })

    await invalidateAllUserGoogleCache(ids.userId)

    await createAuditLog({
      actorId: ids.userId,
      action: 'google_calendar_disconnected',
      entity: 'integrations',
      entityId: ids.userId,
      summary: `Google Calendar desconectado${calendarDeleted ? ' e agenda excluída do Google Calendar' : ''}`
    })

    return { calendarDeleted }
  }
)

export const updateCalendarNameAction = defineAction<{ body: UpdateCalendarNameBody }>(
  {
    method: 'patch',
    path: '/google/calendar/name',
    summary: 'Atualiza o nome da agenda vinculada no Google Calendar',
    tags: ['Google'],
    middlewares: [authMiddleware],
    schema: { body: updateCalendarNameBodySchema },
    responses: {
      200: { description: 'Nome da agenda atualizado com sucesso', schema: updateCalendarNameResponseSchema },
      400: { description: 'Requisição inválida ou agenda não conectada', schema: errorResponseSchema },
      401: { description: 'Não autorizado', schema: errorResponseSchema }
    }
  },
  async ({ ids, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })
    if (!data?.name?.trim()) return manageError({ code: 'bad_request' })

    const userWithToken = await userRepository.findWithGoogleCalendarRefreshToken(ids.userId)
    const googleCalendar = userWithToken?.integrations?.googleCalendar

    if (!googleCalendar?.connected || !googleCalendar.calendarId) return manageError({ code: 'bad_request' })

    const updatedSummary = await renameGoogleCalendar(googleCalendar.refreshToken, googleCalendar.calendarId, data.name.trim())

    if (updatedSummary === null) return manageError({ code: 'bad_request' })

    await userRepository.updateGoogleCalendarName(ids.userId, updatedSummary)
    await invalidateAllUserGoogleCache(ids.userId)

    await createAuditLog({
      actorId: ids.userId,
      action: 'google_calendar_renamed',
      entity: 'integrations',
      entityId: ids.userId,
      summary: `Nome da agenda do Google Calendar alterado para "${updatedSummary}"`
    })

    return { calendarName: updatedSummary }
  }
)

export const recreateCalendarAction = defineAction(
  {
    method: 'post',
    path: '/google/calendar/recreate',
    summary: 'Recria ou restaura a agenda no Google Calendar para o usuário',
    tags: ['Google'],
    middlewares: [authMiddleware],
    responses: {
      200: { description: 'Agenda recriada com sucesso', schema: recreateCalendarResponseSchema },
      400: { description: 'Requisição inválida ou token ausente', schema: errorResponseSchema },
      401: { description: 'Não autorizado', schema: errorResponseSchema }
    }
  },
  async ({ ids, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const userWithToken = await userRepository.findWithGoogleCalendarRefreshToken(ids.userId)
    const googleCalendar = userWithToken?.integrations?.googleCalendar
    const refreshToken = googleCalendar?.refreshToken

    if (!googleCalendar?.connected || !refreshToken) return manageError({ code: 'bad_request' })

    const newCalendar = await getOrCreateLabCalendar(refreshToken, googleCalendar.calendarName || DefaultCalendarName)

    await userRepository.updateGoogleCalendarIntegration(ids.userId, {
      connected: true,
      email: googleCalendar.email,
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
    await invalidateAllUserGoogleCache(ids.userId)

    return {
      calendarId: newCalendar.id,
      calendarName: newCalendar.summary,
      calendarUrl: buildCalendarUrl(newCalendar.id)
    }
  }
)

export const listCalendarsAction = defineAction(
  {
    method: 'get',
    path: '/google/calendar/list',
    summary: 'Lista todas as agendas da conta do Google Calendar do usuário e status de seleção',
    tags: ['Google'],
    middlewares: [authMiddleware],
    responses: {
      200: { description: 'Lista de agendas retornada com sucesso', schema: listCalendarsResponseSchema },
      401: { description: 'Não autorizado', schema: errorResponseSchema }
    }
  },
  async ({ ids, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const userWithToken = await userRepository.findWithGoogleCalendarRefreshToken(ids.userId)
    const googleCalendar = userWithToken?.integrations?.googleCalendar
    const refreshToken = googleCalendar?.refreshToken
    const labCalendarId = googleCalendar?.calendarId
    const labCalendarName = googleCalendar?.calendarName || DefaultCalendarName
    const storedSelectedIds = googleCalendar?.selectedCalendarIds || []

    if (!googleCalendar?.connected || !refreshToken) return { connected: false, items: [], selectedCalendarIds: storedSelectedIds }

    try {
      const googleCalendarItems = await getCachedUserGoogleCalendars(ids.userId, refreshToken)
      const normalizedLabName = labCalendarName.trim().toLowerCase()

      const items = googleCalendarItems.map((item) => {
        const isLabV2 = Boolean((labCalendarId && item.id === labCalendarId) || item.summary.trim().toLowerCase() === normalizedLabName)

        return {
          id: item.id,
          summary: item.summary,
          description: item.description,
          primary: item.primary,
          backgroundColor: item.backgroundColor,
          foregroundColor: item.foregroundColor,
          accessRole: item.accessRole,
          isLabV2,
          selected: isLabV2 || storedSelectedIds.includes(item.id)
        }
      })

      return { connected: true, items, selectedCalendarIds: storedSelectedIds }
    } catch (error) {
      logger.error('Failed to list user google calendars:', error)
      return { connected: true, items: [], selectedCalendarIds: storedSelectedIds }
    }
  }
)

export const updateSelectedCalendarsAction = defineAction<{ body: UpdateSelectedCalendarsBody }>(
  {
    method: 'put',
    path: '/google/calendar/selected',
    summary: 'Atualiza quais agendas devem ser exibidas no calendário',
    tags: ['Google'],
    middlewares: [authMiddleware],
    schema: { body: updateSelectedCalendarsBodySchema },
    responses: {
      200: { description: 'Preferências de agendas atualizadas com sucesso', schema: updateSelectedCalendarsResponseSchema },
      401: { description: 'Não autorizado', schema: errorResponseSchema }
    }
  },
  async ({ ids, data, manageError }) => {
    if (!ids.userId) return manageError({ code: 'unauthorized' })

    const calendarIds = Array.isArray(data?.calendarIds) ? data.calendarIds : []

    await userRepository.updateGoogleCalendarSelectedIds(ids.userId, calendarIds)
    await invalidateUserGoogleEvents(ids.userId)

    await createAuditLog({
      actorId: ids.userId,
      action: 'google_calendar_selection_updated',
      entity: 'integrations',
      entityId: ids.userId,
      summary: `Agendas visíveis atualizadas (${calendarIds.length})`
    })

    return { selectedCalendarIds: calendarIds }
  }
)
