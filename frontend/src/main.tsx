import { MantineProvider, Center, Loader } from '@mantine/core'
import { createRoot } from 'react-dom/client'
import '@mantine/core/styles.css'
import { StrictMode, useEffect } from 'react'

import useAuth from '@hooks/useAuth'
import theme from '@styles/theme'
import Router from '@routes'

export const App = () => {
  const { isLoading, initializeAuth } = useAuth()

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

  return <Router />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      <App />
    </MantineProvider>
  </StrictMode>,
)
