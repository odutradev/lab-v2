import type { ReactNode } from 'react'

export interface PageContainerProps {
  children: ReactNode
  center?: boolean
  className?: string
  size?: string
}
