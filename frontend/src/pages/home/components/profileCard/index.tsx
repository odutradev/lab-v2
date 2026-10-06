import { Stack, Group, Text, Code, Box } from '@mantine/core'
import { TbKey } from 'react-icons/tb'

import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@components/ui/card'
import Button from '@components/ui/button'
import { profileRowStyle, profileResetBoxStyle } from '../../styles'
import type { ProfileCardProps } from './types'

export const ProfileCard = ({ user, onResetPassword }: ProfileCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados do Perfil</CardTitle>
        <CardDescription>Informações cadastrais obtidas do domínio de usuários</CardDescription>
      </CardHeader>
      <CardContent>
        <Stack gap="sm">
          <Group
            justify="space-between"
            pb="xs"
            style={profileRowStyle}
          >
            <Text size="sm" c="dimmed">
              Nome
            </Text>
            <Text size="sm" fw={500} c="white">
              {user?.name}
            </Text>
          </Group>
          <Group
            justify="space-between"
            pb="xs"
            style={profileRowStyle}
          >
            <Text size="sm" c="dimmed">
              E-mail
            </Text>
            <Text size="sm" fw={500} c="white">
              {user?.email}
            </Text>
          </Group>
          <Group
            justify="space-between"
            pb="xs"
            style={profileRowStyle}
          >
            <Text size="sm" c="dimmed">
              ID do Usuário
            </Text>
            <Code c="indigo.3">{user?.id}</Code>
          </Group>
          {user?.accountStatus && (
            <Group
              justify="space-between"
              pb="xs"
              style={profileRowStyle}
            >
              <Text size="sm" c="dimmed">
                Status da Conta
              </Text>
              <Text size="sm" fw={500} c="white">
                {user.accountStatus === 'active' ? 'Ativa' : 'Bloqueada'}
              </Text>
            </Group>
          )}
          {user?.superAdmin !== undefined && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Perfil de Administrador
              </Text>
              <Text size="sm" fw={500} c="white">
                {user.superAdmin ? 'Sim' : 'Não'}
              </Text>
            </Group>
          )}

          <Box mt="xs" pt="xs" style={profileResetBoxStyle}>
            <Button
              variant="outline"
              size="sm"
              onClick={onResetPassword}
              leftIcon={<TbKey size={15} />}
            >
              Redefinir Senha
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default ProfileCard
