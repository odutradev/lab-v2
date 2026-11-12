import type { ReactNode } from 'react'

export interface SegmentedControlItem {
  label: ReactNode
  value: string
  disabled?: boolean
}

export type SegmentedControlSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface SegmentedControlProps {
  value: string
  onChange: (value: string) => void
  data: Array<string | SegmentedControlItem>
  size?: SegmentedControlSize
  height?: number | string
  color?: string
  radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  fullWidth?: boolean
  disabled?: boolean
  className?: string
}
