import type { HealthProfile } from '@stores/health/types'

export interface EditPhysicalInfoModalProps {
  opened: boolean
  onClose: () => void
  currentProfile: HealthProfile
  onSave: (data: Partial<HealthProfile>) => void
}
