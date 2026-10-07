import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import {
  getGoogleCalendarAuthUrlAction,
  getGoogleCalendarStatusAction,
  disconnectGoogleCalendarAction
} from '@actions/google/calendar'
import type { GoogleCalendarStatusResponse } from '@actions/google/calendar/types'
import useToastStore from '@stores/toast'
import useAuthStore from '@stores/auth'
import { getInitials } from '@utils/string'

export const useProfile = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showToast } = useToastStore()

  const [calendarStatus, setCalendarStatus] = useState<GoogleCalendarStatusResponse>({
    connected: !!user?.integrations?.googleCalendar?.connected,
    email: user?.integrations?.googleCalendar?.email,
    connectedAt: user?.integrations?.googleCalendar?.connectedAt
  })
  const [isCalendarLoading, setIsCalendarLoading] = useState(false)
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false)
  const [isDisconnectingCalendar, setIsDisconnectingCalendar] = useState(false)

  const reloadCalendarStatus = useCallback(() => {
    setIsCalendarLoading(true)
    getGoogleCalendarStatusAction()
      .then((status) => {
        setCalendarStatus(status)
      })
      .catch(() => {})
      .finally(() => {
        setIsCalendarLoading(false)
      })
  }, [])

  useEffect(() => {
    let isMounted = true

    getGoogleCalendarStatusAction()
      .then((status) => {
        if (isMounted) setCalendarStatus(status)
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const googleParam = searchParams.get('google')
    if (!googleParam) return

    if (googleParam === 'connected') {
      showToast('Google Agenda vinculada com sucesso!', 'success', 'Google Agenda')
      reloadCalendarStatus()
    } else if (googleParam === 'invalid_state') {
      showToast('A sessão de vinculação expirou. Tente novamente.', 'error', 'Google Agenda')
    } else if (googleParam.startsWith('error')) {
      showToast('Ocorreu um erro ao vincular a conta do Google.', 'error', 'Google Agenda')
    }

    navigate('/profile', { replace: true })
  }, [searchParams, navigate, showToast, reloadCalendarStatus])

  const handleNavigateResetPassword = useCallback(() => {
    navigate('/reset-password')
  }, [navigate])

  const handleNavigateHome = useCallback(() => {
    navigate('/')
  }, [navigate])

  const handleConnectGoogleCalendar = useCallback(async () => {
    try {
      setIsConnectingCalendar(true)
      const { url } = await getGoogleCalendarAuthUrlAction()
      window.location.href = url
    } catch {
      showToast('Não foi possível iniciar a conexão com o Google.', 'error', 'Google Agenda')
      setIsConnectingCalendar(false)
    }
  }, [showToast])

  const handleDisconnectGoogleCalendar = useCallback(async () => {
    try {
      setIsDisconnectingCalendar(true)
      await disconnectGoogleCalendarAction()
      setCalendarStatus({ connected: false })
      showToast('Google Agenda desvinculada com sucesso!', 'success', 'Google Agenda')
    } catch {
      showToast('Erro ao desvincular Google Agenda.', 'error', 'Google Agenda')
    } finally {
      setIsDisconnectingCalendar(false)
    }
  }, [showToast])

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Não informado'
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'Não informado'
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  return {
    user,
    initials: getInitials(user?.name),
    calendarStatus,
    isCalendarLoading,
    isConnectingCalendar,
    isDisconnectingCalendar,
    handleConnectGoogleCalendar,
    handleDisconnectGoogleCalendar,
    handleNavigateResetPassword,
    handleNavigateHome,
    formatDate
  }
}

export default useProfile
