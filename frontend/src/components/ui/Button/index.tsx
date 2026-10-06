import styles from './Button.module.css'

import type { ButtonProps } from './types'

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) => {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    className
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      className={classNames}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className={styles.spinner} />
      ) : (
        leftIcon && <span className={styles.icon}>{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className={styles.icon}>{rightIcon}</span>}
    </button>
  )
}

export default Button
