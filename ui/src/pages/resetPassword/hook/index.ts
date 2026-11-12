import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'

import useAuthStore from '@stores/auth'

import type { UseResetPasswordOptions, UseResetPasswordReturn } from './types'

export const useResetPassword = ({ onBack }: UseResetPasswordOptions = {}): UseResetPasswordReturn => {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack()
      return
    }
    navigate(isAuthenticated ? '/' : '/auth')
  }, [onBack, navigate, isAuthenticated])

  const subtitle = isAuthenticated
    ? 'Altere com segurança a senha de acesso da sua conta'
    : 'Preencha as informações para redefinir o acesso à sua conta'

  return {
    isAuthenticated,
    initialEmail: isAuthenticated ? user?.email : undefined,
    subtitle,
    handleBack
  }
}

export default useResetPassword
