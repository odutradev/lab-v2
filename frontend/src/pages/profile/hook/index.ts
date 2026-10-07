import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import {
  getGoogleCalendarAuthUrlAction,
  getGoogleCalendarStatusAction,
  disconnectGoogleCalendarAction,
  updateGoogleCalendarNameAction,
  recreateGoogleCalendarAction
} from '@actions/google/calendar'
import useToastStore from '@stores/toast'
import useAuthStore from '@stores/auth'
import { getInitials } from '@utils/string'

import type { GoogleCalendarStatusResponse } from '@actions/google/calendar/types'
import type { UseProfileReturn } from './types'

export const useProfile = (): UseProfileReturn => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showToast } = useToastStore()

  const [calendarStatus, setCalendarStatus] = useState<GoogleCalendarStatusResponse>({
    connected: !!user?.integrations?.googleCalendar?.connected,
    email: user?.integrations?.googleCalendar?.email,
    calendarId: user?.integrations?.googleCalendar?.calendarId,
    calendarName: user?.integrations?.googleCalendar?.calendarName,
    connectedAt: user?.integrations?.googleCalendar?.connectedAt ? String(user.integrations.googleCalendar.connectedAt) : undefined
  })
  const [isCalendarLoading, setIsCalendarLoading] = useState(true)
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false)
  const [isDisconnectingCalendar, setIsDisconnectingCalendar] = useState(false)
  const [isSavingCalendarName, setIsSavingCalendarName] = useState(false)
  const [isRecreatingCalendar, setIsRecreatingCalendar] = useState(false)

  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false)
  const [isEditCalendarNameModalOpen, setIsEditCalendarNameModalOpen] = useState(false)
  const [calendarNameInput, setCalendarNameInput] = useState('')

  useEffect(() => {
    let isMounted = true

    getGoogleCalendarStatusAction()
      .then((status) => {
        if (isMounted) setCalendarStatus(status)
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsCalendarLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const googleParam = searchParams.get('google')
    if (!googleParam) return

    if (googleParam === 'connected') {
      showToast('Google Agenda vinculada com sucesso!', 'success', 'Google Agenda')
      getGoogleCalendarStatusAction()
        .then((status) => {
          setCalendarStatus(status)
        })
        .catch(() => {})
    } else if (googleParam === 'invalid_state') {
      showToast('A sessão de vinculação expirou. Tente novamente.', 'error', 'Google Agenda')
    } else if (googleParam.startsWith('error')) {
      showToast('Ocorreu um erro ao vincular a conta do Google.', 'error', 'Google Agenda')
    }

    navigate('/profile', { replace: true })
  }, [searchParams, navigate, showToast])

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

  const openDisconnectModal = useCallback(() => {
    setIsDisconnectModalOpen(true)
  }, [])

  const closeDisconnectModal = useCallback(() => {
    if (!isDisconnectingCalendar) {
      setIsDisconnectModalOpen(false)
    }
  }, [isDisconnectingCalendar])

  const handleConfirmDisconnect = useCallback(
    async (deleteCalendar: boolean) => {
      try {
        setIsDisconnectingCalendar(true)
        await disconnectGoogleCalendarAction({ deleteCalendar })
        setCalendarStatus({ connected: false })
        setIsDisconnectModalOpen(false)
        showToast(
          deleteCalendar
            ? 'Google Agenda desvinculada e removida com sucesso!'
            : 'Google Agenda desvinculada com sucesso!',
          'success',
          'Google Agenda'
        )
      } catch {
        showToast('Erro ao desvincular Google Agenda.', 'error', 'Google Agenda')
      } finally {
        setIsDisconnectingCalendar(false)
      }
    },
    [showToast]
  )

  const openEditCalendarNameModal = useCallback(() => {
    setCalendarNameInput(calendarStatus.calendarName || 'Lab V2')
    setIsEditCalendarNameModalOpen(true)
  }, [calendarStatus.calendarName])

  const closeEditCalendarNameModal = useCallback(() => {
    if (!isSavingCalendarName) {
      setIsEditCalendarNameModalOpen(false)
    }
  }, [isSavingCalendarName])

  const handleSaveCalendarName = useCallback(async () => {
    const trimmed = calendarNameInput.trim()
    if (!trimmed) {
      showToast('O nome da agenda não pode ficar vazio.', 'warning', 'Google Agenda')
      return
    }

    try {
      setIsSavingCalendarName(true)
      const response = await updateGoogleCalendarNameAction({ name: trimmed })
      setCalendarStatus((prev) => ({
        ...prev,
        calendarName: response.calendarName
      }))
      setIsEditCalendarNameModalOpen(false)
      showToast('Nome da agenda atualizado com sucesso!', 'success', 'Google Agenda')
    } catch {
      showToast('Erro ao atualizar o nome da agenda.', 'error', 'Google Agenda')
    } finally {
      setIsSavingCalendarName(false)
    }
  }, [calendarNameInput, showToast])

  const handleRecreateCalendar = useCallback(async () => {
    try {
      setIsRecreatingCalendar(true)
      const response = await recreateGoogleCalendarAction()
      setCalendarStatus((prev) => ({
        ...prev,
        connected: true,
        calendarId: response.calendarId,
        calendarName: response.calendarName,
        calendarUrl: response.calendarUrl,
        calendarDeleted: false
      }))
      showToast('Agenda recriada com sucesso no Google Agenda!', 'success', 'Google Agenda')
    } catch {
      showToast('Erro ao recriar a agenda no Google Agenda.', 'error', 'Google Agenda')
    } finally {
      setIsRecreatingCalendar(false)
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
    isSavingCalendarName,
    isRecreatingCalendar,
    isDisconnectModalOpen,
    isEditCalendarNameModalOpen,
    calendarNameInput,
    setCalendarNameInput,
    openDisconnectModal,
    closeDisconnectModal,
    handleConfirmDisconnect,
    openEditCalendarNameModal,
    closeEditCalendarNameModal,
    handleSaveCalendarName,
    handleRecreateCalendar,
    handleConnectGoogleCalendar,
    handleNavigateResetPassword,
    handleNavigateHome,
    formatDate
  }
}

export default useProfile
