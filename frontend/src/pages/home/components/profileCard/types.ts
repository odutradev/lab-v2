import type { UserProfile } from '@projectTypes/user'

export interface ProfileCardProps {
  user: UserProfile | null
  onResetPassword: () => void
}
