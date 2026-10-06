import { Box } from '@mantine/core'

import ResetPasswordForm from '@pages/resetPassword/components/resetPasswordForm'
import Card, { CardContent } from '@components/ui/card'
import { AuthHeader, AuthTabs, LoginForm, RegisterForm } from './components'
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
    </Box>
  )
}

export default AuthPage
