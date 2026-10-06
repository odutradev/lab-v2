import { Box, Title, Text, Stack, ThemeIcon, SegmentedControl } from '@mantine/core'
import { TbStack2, TbKey } from 'react-icons/tb'
import { useState } from 'react'

import ResetPasswordForm from '@pages/resetPasswordPage/components/resetPasswordForm'
import Card, { CardContent } from '@components/ui/card'
import RegisterForm from './components/registerForm'
import LoginForm from './components/loginForm'
import { containerStyle } from './styles'

import type { AuthMode } from './types'

export const AuthPage = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login')

  const getSubtitle = () => {
    if (authMode === 'login') return 'Entre com suas credenciais para acessar sua conta'
    if (authMode === 'register') return 'Preencha os dados abaixo para criar sua conta'
    return 'Preencha as informações para redefinir o acesso à sua conta'
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
          {authMode === 'reset' ? <TbKey size={28} /> : <TbStack2 size={28} />}
        </ThemeIcon>
        <Title order={1} size="h2" fw={800} c="white">
          {authMode === 'reset' ? 'Redefinir Senha' : 'LAB Portal'}
        </Title>
        <Text size="sm" c="dimmed">
          {getSubtitle()}
        </Text>
      </Stack>

      <Card>
        <CardContent>
          {authMode === 'reset' ? (
            <ResetPasswordForm
              onSuccess={() => setAuthMode('login')}
              onCancel={() => setAuthMode('login')}
            />
          ) : (
            <>
              <SegmentedControl
                fullWidth
                value={authMode}
                onChange={(val) => setAuthMode(val as 'login' | 'register')}
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
                <LoginForm onForgotPassword={() => setAuthMode('reset')} />
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
