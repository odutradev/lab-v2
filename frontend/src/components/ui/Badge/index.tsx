import type { BadgeProps } from './types'
import styles from './Badge.module.css'

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
