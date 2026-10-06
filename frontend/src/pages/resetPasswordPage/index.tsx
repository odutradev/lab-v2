import { Box, Title, Text, Stack, ThemeIcon } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { TbKey } from 'react-icons/tb'

import ResetPasswordForm from './components/resetPasswordForm'
import Card, { CardContent } from '@components/ui/card'
import { containerStyle } from './styles'
import useAuthStore from '@stores/auth'

import type { ResetPasswordPageProps } from './types'

export const ResetPasswordPage = ({ onBack }: ResetPasswordPageProps) => {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
      return
    }
    navigate(isAuthenticated ? '/' : '/auth')
  }

  return (
    <Box w="100%" style={containerStyle}>
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
