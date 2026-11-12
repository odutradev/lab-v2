export interface WaterTrackerCardProps {
  currentWeight?: number
  consumedBottles: number
  extraBottlesTarget: number
  onToggleBottle: (index: number) => void
  onAddExtraBottle: () => void
  onResetToday: () => void
}

export interface WaterBottleItemProps {
  index: number
  isFilled: boolean
  onClick: () => void
}
