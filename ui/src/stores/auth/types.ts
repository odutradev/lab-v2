import type { SignInPayload, SignUpPayload } from '@actions/users/auth/types'
import type { UserProfile } from '@projectTypes/user'

export interface AuthState {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: SignInPayload) => Promise<void>
  register: (data: SignUpPayload) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  initializeAuth: () => Promise<void>
}
