import { MantineProvider, Center, Loader } from '@mantine/core'

import PageContainer from '@components/layout/PageContainer'
import ToastContainer from '@components/ui/Toast'
import ToastProvider from '@context/toast'
import Navbar from '@components/layout/Navbar'
import AuthProvider from '@context/auth'
import AuthPage from '@pages/AuthPage'
import HomePage from '@pages/HomePage'
import useAuth from '@hooks/useAuth'
import theme from '@styles/theme'

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader color="indigo" size="lg" />
      </Center>
    )
  }

  return (
    <>
      {isAuthenticated && <Navbar />}
      <PageContainer center={!isAuthenticated}>
        {isAuthenticated ? <HomePage /> : <AuthPage />}
      </PageContainer>
      <ToastContainer />
    </>
  )
}

export const App = () => {
  return (
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </MantineProvider>
  )
}

export default App
