import type { UserProfile } from '@projectTypes/user'

export interface ProfileHeaderProps {
  user: UserProfile
  initials: string
  onBack: () => void
}
