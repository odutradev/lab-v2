import type { CharacterId } from '@stores/health/types'

export interface CharacterAvatarProps {
  id: CharacterId
  size?: number
  interactive?: boolean
  onClick?: () => void
}
