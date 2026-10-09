export interface EditWaterModalProps {
  opened: boolean
  onClose: () => void
  currentWeight?: number
  currentAge?: number
  currentHeight?: number
  currentBottleMl: number
  onSave: (settings: { bottleMl: number }) => void
}
