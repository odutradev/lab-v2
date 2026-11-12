import { Stack, ThemeIcon, Title, Text } from '@mantine/core'
import { TbStack2, TbKey } from 'react-icons/tb'

import type { AuthHeaderProps } from './types'

export const AuthHeader = ({ title, subtitle, isResetMode }: AuthHeaderProps) => {
  return (
    <Stack align="center" gap="xs" mb="xl" ta="center">
      <ThemeIcon
        size={56}
        radius="xl"
        variant="gradient"
        gradient={{ from: 'indigo', to: 'cyan' }}
      >
        {isResetMode ? <TbKey size={28} /> : <TbStack2 size={28} />}
      </ThemeIcon>
      <Title order={1} size="h2" fw={800} c="white">
        {title}
      </Title>
      <Text size="sm" c="dimmed">
        {subtitle}
      </Text>
    </Stack>
  )
}

export default AuthHeader
