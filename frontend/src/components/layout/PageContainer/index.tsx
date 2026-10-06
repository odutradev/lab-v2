import styles from './PageContainer.module.css'

import type { PageContainerProps } from './types'

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

export default PageContainer
