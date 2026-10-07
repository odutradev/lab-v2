import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import useAuthStore from '@stores/auth'
import { getInitials } from '@utils/string'

export const useProfile = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const handleNavigateResetPassword = useCallback(() => {
    navigate('/reset-password')
  }, [navigate])

  const handleNavigateHome = useCallback(() => {
    navigate('/')
  }, [navigate])

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
    handleNavigateResetPassword,
    handleNavigateHome,
    formatDate
  }
}

export default useProfile
