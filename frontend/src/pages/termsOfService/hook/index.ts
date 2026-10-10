import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'

import useAuthStore from '@stores/auth'

import type { UseTermsOfServiceOptions, UseTermsOfServiceReturn } from './types'

export const useTermsOfServicePage = ({ onBack }: UseTermsOfServiceOptions = {}): UseTermsOfServiceReturn => {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack()
      return
    }
    navigate(isAuthenticated ? '/' : '/auth')
  }, [onBack, navigate, isAuthenticated])

  return {
    lastUpdated: '10 de outubro de 2026',
    handleBack
  }
}

export default useTermsOfServicePage
