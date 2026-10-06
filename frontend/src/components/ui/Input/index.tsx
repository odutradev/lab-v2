import { useState, forwardRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import styles from './Input.module.css'

import type { InputProps } from './types'

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      type = 'text',
      required,
      className = '',
      id,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    const isPassword = type === 'password'
    const computedType = isPassword ? (showPassword ? 'text' : 'password') : type

    const wrapperClassNames = [
      styles.inputWrapper,
      isFocused ? styles.focused : '',
      error ? styles.hasError : ''
    ]
      .filter(Boolean)
      .join(' ')

    const inputClassNames = [
      styles.input,
      leftIcon ? styles.withLeftIcon : '',
      rightIcon || isPassword ? styles.withRightIcon : '',
      className
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div className={styles.container}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}
        <div className={wrapperClassNames}>
          {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
          <input
            id={inputId}
            ref={ref}
            type={computedType}
            className={inputClassNames}
            onFocus={(e) => {
              setIsFocused(true)
              onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              onBlur?.(e)
            }}
            {...props}
          />
          {isPassword ? (
            <span className={styles.rightIcon}>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          ) : (
            rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>
          )}
        </div>
        {error && <span className={styles.errorMessage}>{error}</span>}
        {!error && helperText && <span className={styles.helperText}>{helperText}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
