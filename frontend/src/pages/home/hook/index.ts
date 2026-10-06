import { useNavigate } from 'react-router-dom'
import { useState, useCallback } from 'react'

import { getProfileAction } from '@actions/users/profile'
import useToastStore from '@stores/toast'
import useAuthStore from '@stores/auth'

import type { UseHomePageReturn } from './types'

export const useHomePage = (): UseHomePageReturn => {
  const { user, token, refreshUser } = useAuthStore()
  const { showToast } = useToastStore()
  const navigate = useNavigate()
  const [actionLoading, setActionLoading] = useState(false)
  const [actionResult, setActionResult] = useState<string | null>(null)

  const handleFetchProfile = useCallback(async () => {
    setActionLoading(true)
    try {
      const data = await getProfileAction()
      setActionResult(JSON.stringify(data, null, 2))
      await refreshUser()
      showToast('Perfil atualizado via getProfileAction()', 'success')
    } catch (err: unknown) {
      const errorMsg = (err as Error)?.message || 'Falha ao buscar perfil'
      setActionResult(`Erro: ${errorMsg}`)
      showToast(errorMsg, 'error')
    } finally {
      setActionLoading(false)
    }
  }, [refreshUser, showToast])

  const handleNavigateResetPassword = useCallback(() => {
    navigate('/reset-password')
  }, [navigate])

  const handleNavigateHabits = useCallback(() => {
    navigate('/habits')
  }, [navigate])

  return {
    user,
    token,
    actionLoading,
    actionResult,
    handleFetchProfile,
    handleNavigateResetPassword,
    handleNavigateHabits
  }
}

export default useHomePage
