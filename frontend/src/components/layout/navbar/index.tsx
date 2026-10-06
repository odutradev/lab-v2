import { Group, Box, Text, Avatar, ThemeIcon, Container } from '@mantine/core'
import { TbLogout, TbStack2, TbKey } from 'react-icons/tb'

import useNavigation from '@hooks/useNavigation'
import Button from '@components/ui/button'
import Badge from '@components/ui/badge'
import useAuth from '@hooks/useAuth'

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const { currentRoute, navigate } = useNavigation()

  const getRoleLabel = () => {
    if (!user) return ''
    if (user.superAdmin) return 'Administrador'
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
        <Group
          gap="xs"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('home')}
        >
          <ThemeIcon
            size="md"
            radius="md"
            variant="gradient"
            gradient={{ from: 'indigo', to: 'cyan' }}
          >
            <TbStack2 size={18} />
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
                  <Badge variant={user.superAdmin ? 'primary' : 'info'}>
                    {getRoleLabel()}
                  </Badge>
                </Box>
              </Box>
            </Group>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(currentRoute === 'reset-password' ? 'home' : 'reset-password')}
              leftIcon={<TbKey size={16} />}
            >
              {currentRoute === 'reset-password' ? 'Início' : 'Redefinir Senha'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              leftIcon={<TbLogout size={16} />}
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
