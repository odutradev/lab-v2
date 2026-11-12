import {
  ActionIcon as MantineActionIcon,
  type ActionIconVariant as MantineVariant
} from '@mantine/core'

import type { ActionIconProps, ActionIconVariant } from './types'

const variantMap: Record<
  ActionIconVariant,
  { variant: MantineVariant; color?: string }
> = {
  primary: { variant: 'filled', color: 'indigo' },
  secondary: { variant: 'light', color: 'indigo' },
  outline: { variant: 'outline', color: 'indigo' },
  subtle: { variant: 'subtle', color: 'gray' },
  ghost: { variant: 'subtle', color: 'gray' },
  danger: { variant: 'filled', color: 'red' }
}

export const ActionIcon = ({
  children,
  variant = 'subtle',
  size = 'md',
  color,
  radius = 'md',
  isLoading = false,
  disabled,
  className,
  type = 'button',
  h,
  w,
  style,
  ...props
}: ActionIconProps) => {
  const config = variantMap[variant]

  return (
    <MantineActionIcon
      type={type}
      variant={config.variant}
      color={color || config.color}
      size={size}
      radius={radius}
      loading={isLoading}
      disabled={disabled}
      className={className}
      style={{
        ...(h !== undefined ? { height: h } : {}),
        ...(w !== undefined ? { width: w } : {}),
        ...(style as React.CSSProperties)
      }}
      {...props}
    >
      {children}
    </MantineActionIcon>
  )
}

export default ActionIcon
