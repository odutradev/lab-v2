import { SimpleGrid, Paper, Stack, Group, Title, Text, Code, ThemeIcon, Box } from '@mantine/core'
import { IconShield, IconActivity, IconStack2, IconRefresh } from '@tabler/icons-react'
import { useState } from 'react'

import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@components/ui/card'
import { getProfileAction } from '@actions/users/profile'
import Button from '@components/ui/button'
import Badge from '@components/ui/badge'
import useToast from '@hooks/useToast'
import useAuth from '@hooks/useAuth'

export const HomePage = () => {
  const { user, token, refreshUser } = useAuth()
  const { showToast } = useToast()
  const [actionLoading, setActionLoading] = useState(false)
  const [actionResult, setActionResult] = useState<string | null>(null)

  const handleFetchProfile = async () => {
    setActionLoading(true)
    try {
      const data = await getProfileAction()
      setActionResult(JSON.stringify(data, null, 2))
      await refreshUser()
      showToast('Perfil atualizado via getProfileAction()', 'success')
    } catch (err: unknown) {
      const errorMsg = (err as Error)?.message || 'Falha ao buscar perfil'
      setActionResult(`Erro: ${errorMsg}`)
      showToast(errorMsg, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <Stack gap="xl" w="100%">
      <Paper
        p="xl"
        radius="lg"
        withBorder
        style={{
          background:
            'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
          borderColor: 'rgba(99, 102, 241, 0.3)'
        }}
      >
        <Stack gap="xs">
          <Title order={1} size="h2" fw={800} c="white">
            Olá, {user?.name}!
          </Title>
          <Text size="sm" c="dimmed">
            Bem-vindo ao painel principal da plataforma LAB. Sua sessão está ativa e autenticada.
          </Text>
          <Group gap="xs" mt="xs">
            {user?.isOwner && <Badge variant="primary">Proprietário</Badge>}
            {user?.isTenant && <Badge variant="info">Inquilino</Badge>}
            <Badge variant="success">Autenticado</Badge>
          </Group>
        </Stack>
      </Paper>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
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
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
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
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
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
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
              >
                <Text size="sm" c="dimmed">
                  ID do Usuário
                </Text>
                <Code c="indigo.3">{user?.id}</Code>
              </Group>
              {user?.phone && (
                <Group
                  justify="space-between"
                  pb="xs"
                  style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
                >
                  <Text size="sm" c="dimmed">
                    Telefone
                  </Text>
                  <Text size="sm" fw={500} c="white">
                    {user.phone}
                  </Text>
                </Group>
              )}
              {user?.document && (
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Documento
                  </Text>
                  <Text size="sm" fw={500} c="white">
                    {user.document}
                  </Text>
                </Group>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Execução de Actions</CardTitle>
            <CardDescription>Executar actions isoladas por domínios (users/profile)</CardDescription>
          </CardHeader>
          <CardContent>
            <Stack gap="md">
              <Group>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleFetchProfile}
                  isLoading={actionLoading}
                  leftIcon={<IconRefresh size={15} />}
                >
                  getProfileAction()
                </Button>
              </Group>

              {actionResult ? (
                <Code
                  block
                  p="md"
                  style={{ borderRadius: 8, maxHeight: 200, overflowY: 'auto' }}
                >
                  {actionResult}
                </Code>
              ) : (
                <Paper p="md" radius="sm" bg="rgba(0, 0, 0, 0.25)" withBorder>
                  <Text size="xs" c="dimmed">
                    Clique acima para disparar a action e inspecionar a resposta da API em tempo real.
                  </Text>
                </Paper>
              )}
            </Stack>
          </CardContent>
        </Card>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
        <Card>
          <CardContent>
            <Group gap="md">
              <ThemeIcon size="lg" radius="md" variant="light" color="indigo">
                <IconShield size={22} />
              </ThemeIcon>
              <Box>
                <Text size="xs" c="dimmed">
                  Token de Acesso
                </Text>
                <Text size="sm" fw={600} c="white">
                  {token ? 'JWT Válido' : 'Não encontrado'}
                </Text>
              </Box>
            </Group>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Group gap="md">
              <ThemeIcon size="lg" radius="md" variant="light" color="cyan">
                <IconStack2 size={22} />
              </ThemeIcon>
              <Box>
                <Text size="xs" c="dimmed">
                  Arquitetura de Actions
                </Text>
                <Text size="sm" fw={600} c="white">
                  Domínio users Ativo
                </Text>
              </Box>
            </Group>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Group gap="md">
              <ThemeIcon size="lg" radius="md" variant="light" color="teal">
                <IconActivity size={22} />
              </ThemeIcon>
              <Box>
                <Text size="xs" c="dimmed">
                  Estado da Aplicação
                </Text>
                <Text size="sm" fw={600} c="white">
                  Online & Pronto
                </Text>
              </Box>
            </Group>
          </CardContent>
        </Card>
      </SimpleGrid>
    </Stack>
  )
}

export default HomePage
