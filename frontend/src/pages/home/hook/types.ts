import type { UserProfile } from '@projectTypes/user'

export interface UseHomePageReturn {
  user: UserProfile | null
  token: string | null
  actionLoading: boolean
  actionResult: string | null
  handleFetchProfile: () => Promise<void>
  handleNavigateResetPassword: () => void
}
