import { type ReactNode } from 'react'
import styles from './PageContainer.module.css'

export interface PageContainerProps {
  children: ReactNode
  center?: boolean
  className?: string
}

export const PageContainer = ({
  children,
  center = false,
  className = ''
}: PageContainerProps) => {
  return (
    <main
      className={`${styles.container} ${center ? styles.center : ''} ${className}`}
    >
      {children}
    </main>
  )
}
