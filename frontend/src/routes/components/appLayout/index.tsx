import { Box } from '@mantine/core'

import ToastContainer from '@components/ui/toast'
import Navbar from '@components/layout/navbar'
import useAuth from '@hooks/useAuth'

import type { AppLayoutProps } from './types'

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { isAuthenticated } = useAuth()

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
      {children}
      <ToastContainer />
    </Box>
  )
}

export default AppLayout
