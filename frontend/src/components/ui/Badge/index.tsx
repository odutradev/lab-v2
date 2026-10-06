import styles from './Badge.module.css'

import type { BadgeProps } from './types'

export const Badge = ({
  children,
  variant = 'default',
  className = '',
  ...props
}: BadgeProps) => {
  return (
    <span
      className={`${styles.badge} ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge
