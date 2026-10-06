import type { PageContainerProps } from './types'
import styles from './PageContainer.module.css'

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
