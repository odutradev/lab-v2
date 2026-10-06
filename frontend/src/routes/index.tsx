import PageContainer from '@components/layout/pageContainer'
import ResetPasswordPage from '@pages/resetPasswordPage'
import useNavigation from '@hooks/useNavigation'
import AuthPage from '@pages/authPage'
import HomePage from '@pages/homePage'
import useAuth from '@hooks/useAuth'

export const Router = () => {
  const { isAuthenticated } = useAuth()
  const { currentRoute, navigate } = useNavigation()

  if (currentRoute === 'reset-password') {
    return (
      <PageContainer center>
        <ResetPasswordPage
          onBack={() => navigate(isAuthenticated ? 'home' : 'auth')}
        />
      </PageContainer>
    )
  }

  if (isAuthenticated) {
    return (
      <PageContainer>
        <HomePage />
      </PageContainer>
    )
  }

  return (
    <PageContainer center>
      <AuthPage />
    </PageContainer>
  )
}

export default Router
