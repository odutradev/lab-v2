import type { CharacterId, HealthProfile } from '@stores/health/types'

export interface CharacterCardProps {
  profile: HealthProfile
  latestWeight?: number
  onUpdateProfile: (data: Partial<HealthProfile>) => void
}

export interface EditPhysicalInfoModalProps {
  opened: boolean
  onClose: () => void
  currentProfile: HealthProfile
  onSave: (data: Partial<HealthProfile>) => void
}

export interface CharacterAvatarProps {
  id: CharacterId
  size?: number
  interactive?: boolean
  onClick?: () => void
}
