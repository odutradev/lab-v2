export interface CompactWaterCardProps {
  currentWeight?: number
  currentAge?: number
  currentHeight?: number
  consumedBottles: number
  extraBottlesTarget: number
  bottleMl?: number
  selectedDate?: string
  onToggleBottle: (index: number) => void
  onAddExtraBottle: () => void
  onRemoveExtraBottle?: () => void
  onUpdateSettings?: (settings: { bottleMl: number }) => void
}
