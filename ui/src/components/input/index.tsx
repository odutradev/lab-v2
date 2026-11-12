import { TextInput, PasswordInput } from '@mantine/core'
import { forwardRef } from 'react'

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
      className,
      id,
      size: _htmlSize,
      ...props
    },
    ref
  ) => {
    const commonProps = {
      ref,
      id,
      label,
      error,
      description: helperText,
      leftSection: leftIcon,
      required,
      size: 'md' as const,
      radius: 'md' as const,
      className,
      ...props
    }

    if (type === 'password') {
      return <PasswordInput {...commonProps} />
    }

    return <TextInput type={type} rightSection={rightIcon} {...commonProps} />
  }
)

Input.displayName = 'Input'

export default Input
