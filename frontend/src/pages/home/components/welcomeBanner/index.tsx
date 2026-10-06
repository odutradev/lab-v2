import { Paper, Stack, Title, Text, Group } from '@mantine/core'

import Badge from '@components/ui/badge'
import { welcomePaperStyle } from '../../styles'
import type { WelcomeBannerProps } from './types'

export const WelcomeBanner = ({ user }: WelcomeBannerProps) => {
  return (
    <Paper
      p="xl"
      radius="lg"
      withBorder
      style={welcomePaperStyle}
    >
      <Stack gap="xs">
        <Title order={1} size="h2" fw={800} c="white">
          Olá, {user?.name}!
        </Title>
        <Text size="sm" c="dimmed">
          Bem-vindo ao painel principal da plataforma LAB. Sua sessão está ativa e autenticada.
        </Text>
        <Group gap="xs" mt="xs">
          {user?.superAdmin && <Badge variant="primary">Administrador</Badge>}
          <Badge variant="success">Autenticado</Badge>
        </Group>
      </Stack>
    </Paper>
  )
}

export default WelcomeBanner
