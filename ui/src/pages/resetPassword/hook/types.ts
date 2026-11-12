export interface UseResetPasswordOptions {
  onBack?: () => void
}

export interface UseResetPasswordReturn {
  isAuthenticated: boolean
  initialEmail: string | undefined
  subtitle: string
  handleBack: () => void
}
