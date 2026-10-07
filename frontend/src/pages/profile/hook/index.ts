import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import useAuthStore from '@stores/auth'

export const useProfile = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const handleNavigateResetPassword = useCallback(() => {
    navigate('/reset-password')
  }, [navigate])

  const handleNavigateHome = useCallback(() => {
    navigate('/')
  }, [navigate])

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }

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
