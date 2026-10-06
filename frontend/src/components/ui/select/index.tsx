import { NativeSelect } from '@mantine/core'
import { forwardRef } from 'react'

import type { SelectProps } from './types'

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, required, className, id, size: _htmlSize, ...props }, ref) => {
    return (
      <NativeSelect
        ref={ref}
        id={id}
        label={label}
        error={error}
        data={options}
        required={required}
        size="md"
        radius="md"
        className={className}
        {...props}
      />
    )
  }
)

Select.displayName = 'Select'

export default Select
