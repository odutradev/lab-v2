import { MantineProvider, Center, Loader, Box } from '@mantine/core'
import { createRoot } from 'react-dom/client'
import '@mantine/core/styles.css'
import { StrictMode, useEffect } from 'react'

import ToastContainer from '@components/ui/toast'
import Navbar from '@components/layout/navbar'
import useAuth from '@hooks/useAuth'
import theme from '@styles/theme'
import Router from '@routes'

export const App = () => {
  const { isAuthenticated, isLoading, initializeAuth } = useAuth()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

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
      <Router />
      <ToastContainer />
    </Box>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      <App />
    </MantineProvider>
  </StrictMode>,
)
