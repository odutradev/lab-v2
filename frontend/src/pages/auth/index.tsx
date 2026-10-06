import { Box, Title, Text, Stack, ThemeIcon, SegmentedControl } from '@mantine/core'
import { TbStack2, TbKey } from 'react-icons/tb'

import ResetPasswordForm from '@pages/resetPassword/components/resetPasswordForm'
import Card, { CardContent } from '@components/ui/card'
import RegisterForm from './components/registerForm'
import LoginForm from './components/loginForm'
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
      <Stack align="center" gap="xs" mb="xl" ta="center">
        <ThemeIcon
          size={56}
          radius="xl"
          variant="gradient"
          gradient={{ from: 'indigo', to: 'cyan' }}
        >
          {isResetMode ? <TbKey size={28} /> : <TbStack2 size={28} />}
        </ThemeIcon>
        <Title order={1} size="h2" fw={800} c="white">
          {title}
        </Title>
        <Text size="sm" c="dimmed">
          {subtitle}
        </Text>
      </Stack>

      <Card>
        <CardContent>
          {isResetMode ? (
            <ResetPasswordForm
              onSuccess={goToLogin}
              onCancel={goToLogin}
            />
          ) : (
            <>
              <SegmentedControl
                fullWidth
                value={authMode}
                onChange={handleModeChange}
                data={[
                  { label: 'Entrar', value: 'login' },
                  { label: 'Cadastrar', value: 'register' }
                ]}
                color="indigo"
                radius="md"
                size="md"
                mb="lg"
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
    </Box>
  )
}

export default AuthPage
