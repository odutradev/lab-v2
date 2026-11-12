import { Box, Group, Text, Anchor } from '@mantine/core'
import { Link } from 'react-router-dom'

import ResetPasswordForm from '@components/shared/resetPasswordForm'
import Card, { CardContent } from '@components/ui/card'
import AuthHeader from './components/authHeader'
import AuthTabs from './components/authTabs'
import LoginForm from './components/loginForm'
import RegisterForm from './components/registerForm'
import { containerStyle } from './styles'
import useAuthPage from './hook'

export const AuthPage = () => {
  const {
    authMode,
    title,
    subtitle,
    isResetMode,
    handleModeChange,
    goToLogin,
    goToReset
  } = useAuthPage()

  return (
    <Box w="100%" style={containerStyle}>
      <AuthHeader
        title={title}
        subtitle={subtitle}
        isResetMode={isResetMode}
      />

      <Card>
        <CardContent>
          {isResetMode ? (
            <ResetPasswordForm
              onSuccess={goToLogin}
              onCancel={goToLogin}
            />
          ) : (
            <>
              <AuthTabs
                value={authMode}
                onChange={handleModeChange}
              />

              {authMode === 'login' ? (
                <LoginForm onForgotPassword={goToReset} />
              ) : (
                <RegisterForm />
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Group justify="center" gap="sm" mt="lg">
        <Anchor component={Link} to="/privacy" size="xs" c="dimmed">
          Política de Privacidade
        </Anchor>
        <Text size="xs" c="dimmed">
          •
        </Text>
        <Anchor component={Link} to="/terms" size="xs" c="dimmed">
          Termos de Serviço
        </Anchor>
      </Group>
    </Box>
  )
}

export default AuthPage
