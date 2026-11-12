import { SegmentedControl as MantineSegmentedControl, alpha } from '@mantine/core'

import type { SegmentedControlProps } from './types'
import { colors } from '@styles/theme'

export const SegmentedControl = ({
  value,
  onChange,
  data,
  size = 'sm',
  height,
  color = 'indigo',
  radius = 'md',
  fullWidth = false,
  disabled = false,
  className
}: SegmentedControlProps) => {
  return (
    <MantineSegmentedControl
      value={value}
      onChange={onChange}
      data={data}
      size={size}
      color={color}
      radius={radius}
      fullWidth={fullWidth}
      disabled={disabled}
      className={className}
      styles={{
        root: {
          backgroundColor: alpha(colors.black, 0.35),
          border: `1px solid ${alpha(colors.white, 0.08)}`,
          ...(height !== undefined ? { height, minHeight: height } : {})
        },
        control: height !== undefined ? { height: '100%' } : undefined,
        label:
          height !== undefined
            ? {
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }
            : undefined
      }}
    />
  )
}

export default SegmentedControl
