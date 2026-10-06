import type { HTMLAttributes, ReactNode } from 'react'

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'info'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  variant?: BadgeVariant
}
