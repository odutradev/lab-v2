import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ActionIconVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'subtle'
  | 'ghost'
  | 'danger'

export type ActionIconSize = 'xs' | 'sm' | 'md' | 'lg'

export interface ActionIconProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  children?: ReactNode
  variant?: ActionIconVariant
  size?: ActionIconSize
  color?: string
  radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  isLoading?: boolean
  h?: number | string
  w?: number | string
}
