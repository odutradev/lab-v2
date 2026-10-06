import { useContext } from 'react'
import { AuthContext } from '../../context/auth'
import type { UseAuthReturn } from './types'

export const useAuth = (): UseAuthReturn => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
