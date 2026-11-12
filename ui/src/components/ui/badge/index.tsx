import { Badge as MantineBadge } from '@mantine/core'

import type { BadgeProps, BadgeVariant } from './types'

const colorMap: Record<BadgeVariant, string> = {
  default: 'gray',
  primary: 'indigo',
  success: 'teal',
  warning: 'yellow',
  info: 'cyan'
}

export const Badge = ({
  children,
  variant = 'default',
  size = 'sm',
  className,
  ...props
}: BadgeProps) => {
  return (
    <MantineBadge
      color={colorMap[variant]}
      variant={variant === 'primary' ? 'filled' : 'light'}
      size={size}
      radius="md"
      className={className}
      {...props}
    >
      {children}
    </MantineBadge>
  )
}

export default Badge
