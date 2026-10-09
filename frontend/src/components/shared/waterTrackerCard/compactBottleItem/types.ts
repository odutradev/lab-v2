export interface CompactBottleItemProps {
  index: number
  isFilled: boolean
  isExtra?: boolean
  bottleMl?: number
  onClick: () => void
  onRemove?: () => void
}

export interface AddBottleButtonProps {
  onClick: () => void
}
