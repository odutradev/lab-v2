import { Stack, ThemeIcon, Title, Text, Group, Button, alpha } from '@mantine/core'
import { TbShieldLock, TbArrowLeft } from 'react-icons/tb'

import type { PrivacyHeaderProps } from './types'
import { colors } from '@styles/theme'

export const PrivacyHeader = ({ lastUpdated, onBack }: PrivacyHeaderProps) => {
  return (
    <Stack gap="md" mb="xl">
      <Group justify="space-between" align="center">
        <Button
          variant="subtle"
          color="gray"
          leftSection={<TbArrowLeft size={18} />}
          onClick={onBack}
          styles={{
            root: {
              color: colors.slate400,
              '&:hover': {
                color: colors.white,
                backgroundColor: alpha(colors.white, 0.05)
              }
            }
          }}
        >
          Voltar
        </Button>
        <Text size="xs" c="dimmed">
          Última atualização: {lastUpdated}
        </Text>
      </Group>

      <Group gap="md" align="center">
        <ThemeIcon
          size={52}
          radius="xl"
          variant="gradient"
          gradient={{ from: 'indigo', to: 'cyan' }}
        >
          <TbShieldLock size={28} />
        </ThemeIcon>
        <div>
          <Title order={1} size="h2" fw={800} c="white">
            Política de Privacidade
          </Title>
          <Text size="sm" c="dimmed">
            Transparência sobre a proteção e o tratamento dos seus dados no Lab
          </Text>
        </div>
      </Group>
    </Stack>
  )
}

export default PrivacyHeader
