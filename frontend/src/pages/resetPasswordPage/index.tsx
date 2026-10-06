import { Box, Title, Text, Stack, ThemeIcon } from '@mantine/core'
import { TbKey } from 'react-icons/tb'

import ResetPasswordForm from '@components/forms/resetPasswordForm'
import Card, { CardContent } from '@components/ui/card'
import useNavigation from '@hooks/useNavigation'
import useAuth from '@hooks/useAuth'

import type { ResetPasswordPageProps } from './types'

export const ResetPasswordPage = ({ onBack }: ResetPasswordPageProps) => {
  const { user, isAuthenticated } = useAuth()
  const { navigate } = useNavigation()

  const handleBack = () => {
    if (onBack) {
      onBack()
      return
    }
    navigate(isAuthenticated ? 'home' : 'auth')
  }

  return (
    <Box w="100%" style={{ maxWidth: 460, margin: '0 auto' }}>
      <Stack align="center" gap="xs" mb="xl" ta="center">
        <ThemeIcon
          size={56}
          radius="xl"
          variant="gradient"
          gradient={{ from: 'indigo', to: 'cyan' }}
        >
          <TbKey size={28} />
        </ThemeIcon>
        <Title order={1} size="h2" fw={800} c="white">
          Redefinição de Senha
        </Title>
        <Text size="sm" c="dimmed">
          {isAuthenticated
            ? 'Altere com segurança a senha de acesso da sua conta'
            : 'Preencha as informações para redefinir o acesso à sua conta'}
        </Text>
      </Stack>

      <Card>
        <CardContent>
          <ResetPasswordForm
            initialEmail={isAuthenticated ? user?.email : undefined}
            onSuccess={handleBack}
            onCancel={handleBack}
          />
        </CardContent>
      </Card>
    </Box>
  )
}

export default ResetPasswordPage
