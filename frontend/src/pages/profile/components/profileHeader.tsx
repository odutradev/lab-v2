import { Group, Box, Title, Text, Avatar, Stack } from '@mantine/core'
import { TbArrowLeft } from 'react-icons/tb'

import Button from '@components/ui/button'
import Badge from '@components/ui/badge'
import Card from '@components/ui/card'
import type { UserProfile } from '@projectTypes/user'

interface ProfileHeaderProps {
  user: UserProfile
  initials: string
  onBack: () => void
}

export const ProfileHeader = ({ user, initials, onBack }: ProfileHeaderProps) => {
  return (
    <Card>
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
        <Group gap="lg" align="center">
          <Avatar size={72} radius="xl" color="indigo" variant="filled">
            <Text fw={700} size="xl">
              {initials}
            </Text>
          </Avatar>

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
