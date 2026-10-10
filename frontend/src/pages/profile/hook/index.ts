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
import { STORAGE_KEYS } from '@api/config'
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
  const [isClearCacheModalOpen, setIsClearCacheModalOpen] = useState(false)
  const [isClearingCache, setIsClearingCache] = useState(false)

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

  const openClearCacheModal = useCallback(() => {
    setIsClearCacheModalOpen(true)
  }, [])

  const closeClearCacheModal = useCallback(() => {
    if (!isClearingCache) {
      setIsClearCacheModalOpen(false)
    }
  }, [isClearingCache])

  const handleClearCache = useCallback(async () => {
    try {
      setIsClearingCache(true)

      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((name) => caches.delete(name)))
      }

      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(registrations.map((registration) => registration.unregister()))
      }

      const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER)

      localStorage.clear()

      if (token) localStorage.setItem(STORAGE_KEYS.TOKEN, token)
      if (refreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
      if (savedUser) localStorage.setItem(STORAGE_KEYS.USER, savedUser)

      sessionStorage.clear()

      showToast('Cache local limpo com sucesso!', 'success')
      setIsClearCacheModalOpen(false)

      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch {
      showToast('Erro ao limpar cache local.', 'error')
      setIsClearingCache(false)
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
    isClearCacheModalOpen,
    isClearingCache,
    openClearCacheModal,
    closeClearCacheModal,
    handleClearCache,
    formatDate
  }
}

export default useProfile
