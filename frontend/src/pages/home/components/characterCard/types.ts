import type { HealthProfile } from '@stores/health/types'

export interface CharacterCardProps {
  profile: HealthProfile
  latestWeight?: number
  onUpdateProfile: (data: Partial<HealthProfile>) => void
}

export type { CharacterAvatarProps } from './characterAvatars/types'
export type { EditPhysicalInfoModalProps } from './editPhysicalInfoModal/types'
