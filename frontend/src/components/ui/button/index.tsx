import { Button as MantineButton, type ButtonVariant as MantineVariant } from '@mantine/core'

import type { ButtonProps, ButtonVariant } from './types'

const variantMap: Record<ButtonVariant, { variant: MantineVariant; color?: string }> = {
  primary: { variant: 'filled', color: 'indigo' },
  secondary: { variant: 'light', color: 'indigo' },
  outline: { variant: 'outline', color: 'indigo' },
  ghost: { variant: 'subtle', color: 'gray' },
  danger: { variant: 'filled', color: 'red' }
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className,
  type = 'button',
  ...props
}: ButtonProps) => {
  const config = variantMap[variant]

  return (
    <MantineButton
      type={type}
      variant={config.variant}
      color={config.color}
      size={size}
      loading={isLoading}
      leftSection={leftIcon}
      rightSection={rightIcon}
      fullWidth={fullWidth}
      disabled={disabled}
      radius="md"
      className={className}
      style={{
        ...(props.h !== undefined ? { height: props.h } : {}),
        ...(props.style as React.CSSProperties)
      }}
      {...props}
    >
      {children}
    </MantineButton>
  )
}

export default Button
