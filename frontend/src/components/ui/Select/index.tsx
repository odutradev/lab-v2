import {
  useState,
  forwardRef
} from 'react'
import { ChevronDown } from 'lucide-react'
import type { SelectProps } from './types'
import styles from './Select.module.css'

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, required, className = '', id, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    const wrapperClassNames = [
      styles.selectWrapper,
      isFocused ? styles.focused : '',
      error ? styles.hasError : ''
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div className={styles.container}>
        {label && (
          <label htmlFor={selectId} className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}
        <div className={wrapperClassNames}>
          <select
            id={selectId}
            ref={ref}
            className={`${styles.select} ${className}`}
            onFocus={(e) => {
              setIsFocused(true)
              onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              onBlur?.(e)
            }}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className={styles.arrowIcon}>
            <ChevronDown size={18} />
          </span>
        </div>
        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    )
  }
)

Select.displayName = 'Select'
