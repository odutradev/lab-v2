import { Stack, ThemeIcon, Title, Text } from '@mantine/core'
import { TbKey } from 'react-icons/tb'

import type { ResetPasswordHeaderProps } from './types'

export const ResetPasswordHeader = ({ subtitle }: ResetPasswordHeaderProps) => {
  return (
    <Stack align="center" gap="xs" mb="xl" ta="center">
      <ThemeIcon
        size={56}
        radius="xl"
        variant="gradient"
        gradient={{ from: 'indigo', to: 'cyan' }}
      >
        <TbKey size={28} />
      </ThemeIcon>
      <Title order={1} size="h2" fw={800} c="white">
        Redefinição de Senha
      </Title>
      <Text size="sm" c="dimmed">
        {subtitle}
      </Text>
    </Stack>
  )
}

export default ResetPasswordHeader
