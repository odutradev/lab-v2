import { MantineProvider, Center, Loader, Box } from '@mantine/core'

import PageContainer from '@components/layout/pageContainer'
import ToastContainer from '@components/ui/toast'
import Navbar from '@components/layout/navbar'
import ToastProvider from '@context/toast'
import AuthProvider from '@context/auth'
import AuthPage from '@pages/AuthPage'
import HomePage from '@pages/HomePage'
import useAuth from '@hooks/useAuth'
import theme from '@styles/theme'

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <Center h="100vh" bg="#0c101c">
        <Loader color="indigo" size="lg" />
      </Center>
    )
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0c101c',
        backgroundImage:
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.18), transparent 70%), radial-gradient(ellipse 60% 40% at 90% 80%, rgba(6, 182, 212, 0.1), transparent 60%)',
        backgroundAttachment: 'fixed'
      }}
    >
      {isAuthenticated && <Navbar />}
      <PageContainer center={!isAuthenticated}>
        {isAuthenticated ? <HomePage /> : <AuthPage />}
      </PageContainer>
      <ToastContainer />
    </Box>
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
