import { MantineProvider, Center, Loader } from '@mantine/core'
import { registerSW } from 'virtual:pwa-register'
import { createRoot } from 'react-dom/client'
import { StrictMode, useEffect } from 'react'
import '@mantine/core/styles.css'
import '@styles/global.css'

registerSW({ immediate: true })

import useAuthStore from '@stores/auth'
import theme from '@styles/theme'
import Router from '@routes'

export const App = () => {
  const { isLoading, initializeAuth } = useAuthStore()

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
