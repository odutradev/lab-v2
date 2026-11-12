import type { UserProfile } from '@projectTypes/user'

export interface ProfileInfoCardProps {
  user: UserProfile
  formatDate: (dateStr?: string) => string
}
