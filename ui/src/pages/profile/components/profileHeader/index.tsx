import { Group, Box, Title, Text, Avatar, Stack, Tooltip } from '@mantine/core'
import { TbArrowLeft } from 'react-icons/tb'

import Button from '@components/ui/button'
import Badge from '@components/ui/badge'
import Card from '@components/ui/card'

import type { ProfileHeaderProps } from './types'

export const ProfileHeader = ({ user, initials, onBack }: ProfileHeaderProps) => {
  const isAdmin = Boolean(user.superAdmin)
  const avatarBorderColor = isAdmin ? '#f59e0b' : '#ffffff'
  const roleTooltipLabel = isAdmin ? 'Administrador' : 'Usuário'

  return (
    <Card>
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
        <Group gap="lg" align="center">
          <Tooltip label={roleTooltipLabel} withArrow position="bottom">
            <Avatar
              size={72}
              radius="xl"
              color="indigo"
              variant="filled"
              style={{
                border: `3px solid ${avatarBorderColor}`,
                boxShadow: isAdmin ? '0 0 14px rgba(245, 158, 11, 0.45)' : undefined
              }}
            >
              <Text fw={700} size="xl">
                {initials}
              </Text>
            </Avatar>
          </Tooltip>

          <Stack gap={4}>
            <Title order={3} fw={700} c="white">
              {user.name}
            </Title>
            <Text size="sm" c="dimmed">
              {user.email}
            </Text>
            <Group gap="xs" mt={4}>
              <Badge variant={user.superAdmin ? 'primary' : 'info'}>
                {user.superAdmin ? 'Administrador' : 'Usuário'}
              </Badge>
              {user.accountStatus && (
                <Badge variant={user.accountStatus === 'active' ? 'success' : 'warning'}>
                  {user.accountStatus === 'active' ? 'Conta Ativa' : 'Bloqueada'}
                </Badge>
              )}
            </Group>
          </Stack>
        </Group>

        <Box>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            leftIcon={<TbArrowLeft size={16} />}
          >
            Voltar
          </Button>
        </Box>
      </Group>
    </Card>
  )
}

export default ProfileHeader
