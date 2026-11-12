import type { AuthMode } from '../types'

export interface UseAuthPageReturn {
  authMode: AuthMode
  title: string
  subtitle: string
  isResetMode: boolean
  handleModeChange: (val: string) => void
  goToLogin: () => void
  goToRegister: () => void
  goToReset: () => void
}
