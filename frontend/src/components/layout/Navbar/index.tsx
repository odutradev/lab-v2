import { Group, Box, Text, Avatar, ThemeIcon, Container } from '@mantine/core'
import { IconLogout, IconStack2 } from '@tabler/icons-react'

import Button from '@components/ui/Button'
import Badge from '@components/ui/Badge'
import useAuth from '@hooks/useAuth'

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()

  const getRoleLabel = () => {
    if (!user) return ''
    if (user.isOwner && user.isTenant) return 'Proprietário & Inquilino'
    if (user.isOwner) return 'Proprietário'
    if (user.isTenant) return 'Inquilino'
    return 'Usuário'
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }

  return (
    <Box
      component="header"
      pos="sticky"
      top={0}
      style={{
        zIndex: 100,
        backdropFilter: 'blur(16px)',
        backgroundColor: 'rgba(9, 13, 22, 0.75)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <Container
        size="lg"
        h={64}
        display="flex"
        style={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Group gap="xs">
          <ThemeIcon
            size="md"
            radius="md"
            variant="gradient"
            gradient={{ from: 'indigo', to: 'cyan' }}
          >
            <IconStack2 size={18} />
          </ThemeIcon>
          <Text fw={700} size="md" c="white" style={{ letterSpacing: '-0.02em' }}>
            LAB Portal
          </Text>
        </Group>

        {isAuthenticated && user && (
          <Group gap="md">
            <Group gap="xs">
              <Avatar radius="xl" size="sm" color="indigo">
                {getInitials(user.name)}
              </Avatar>
              <Box>
                <Text size="sm" fw={600} lh={1.2} c="white">
                  {user.name}
                </Text>
                <Box mt={2}>
                  <Badge variant={user.isOwner ? 'primary' : 'info'}>
                    {getRoleLabel()}
                  </Badge>
                </Box>
              </Box>
            </Group>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              leftIcon={<IconLogout size={16} />}
            >
              Sair
            </Button>
          </Group>
        )}
      </Container>
    </Box>
  )
}

export default Navbar
