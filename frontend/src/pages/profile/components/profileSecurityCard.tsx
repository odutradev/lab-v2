import { Group, Box, Text, ThemeIcon } from '@mantine/core'
import { TbKey } from 'react-icons/tb'

import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@components/ui/card'
import Button from '@components/ui/button'

interface ProfileSecurityCardProps {
  onNavigateResetPassword: () => void
}

export const ProfileSecurityCard = ({ onNavigateResetPassword }: ProfileSecurityCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Segurança e Autenticação</CardTitle>
        <CardDescription>
          Gerencie suas credenciais e configurações de segurança da conta
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <Group gap="md">
            <ThemeIcon size="lg" radius="md" variant="light" color="indigo">
              <TbKey size={20} />
            </ThemeIcon>
            <Box>
              <Text size="sm" fw={600} c="white">
                Senha de Acesso
              </Text>
              <Text size="xs" c="dimmed">
                Recomendamos alterar sua senha periodicamente para manter sua conta protegida
              </Text>
            </Box>
          </Group>

          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateResetPassword}
            leftIcon={<TbKey size={16} />}
          >
            Redefinir Senha
          </Button>
        </Group>
      </CardContent>
    </Card>
  )
}

export default ProfileSecurityCard
