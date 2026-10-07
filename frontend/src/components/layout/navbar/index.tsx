import { Group, Box, Text, Avatar, ThemeIcon, Container, Menu, UnstyledButton } from '@mantine/core'
import { TbLogout, TbStack2, TbUser, TbChevronDown } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'

import useAuthStore from '@stores/auth'
import Badge from '@components/ui/badge'

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

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
          onClick={() => navigate('/')}
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
          <Menu shadow="md" width={180} position="bottom-end">
            <Menu.Target>
              <UnstyledButton
                p="xs"
                style={{
                  borderRadius: 8,
                  transition: 'background-color 0.15s ease'
                }}
              >
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
                  <TbChevronDown size={14} color="rgba(255, 255, 255, 0.5)" />
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown
              style={{
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(16px)'
              }}
            >
              <Menu.Item
                leftSection={<TbUser size={16} />}
                onClick={() => navigate('/profile')}
              >
                Perfil
              </Menu.Item>
              <Menu.Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
              <Menu.Item
                color="red"
                leftSection={<TbLogout size={16} />}
                onClick={logout}
              >
                Sair
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Container>
    </Box>
  )
}

export default Navbar
