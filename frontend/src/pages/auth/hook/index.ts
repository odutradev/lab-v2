import { useState, useCallback } from 'react'

import type { UseAuthPageReturn } from './types'
import type { AuthMode } from '../types'

export const useAuthPage = (): UseAuthPageReturn => {
  const [authMode, setAuthMode] = useState<AuthMode>('login')

  const title = authMode === 'reset' ? 'Redefinir Senha' : 'LAB Portal'

  const subtitle = (() => {
    if (authMode === 'login') return 'Entre com suas credenciais para acessar sua conta'
    if (authMode === 'register') return 'Preencha os dados abaixo para criar sua conta'
    return 'Preencha as informações para redefinir o acesso à sua conta'
  })()

  const isResetMode = authMode === 'reset'

  const handleModeChange = useCallback((val: string) => {
    setAuthMode(val as 'login' | 'register')
  }, [])

  const goToLogin = useCallback(() => {
    setAuthMode('login')
  }, [])

  const goToRegister = useCallback(() => {
    setAuthMode('register')
  }, [])

  const goToReset = useCallback(() => {
    setAuthMode('reset')
  }, [])

  return {
    authMode,
    title,
    subtitle,
    isResetMode,
    handleModeChange,
    goToLogin,
    goToRegister,
    goToReset
  }
}

export default useAuthPage
