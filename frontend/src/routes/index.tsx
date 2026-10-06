import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mantine/core'
import type { ReactNode } from 'react'

import PageContainer from '@components/layout/pageContainer'
import ResetPasswordPage from '@pages/resetPasswordPage'
import ToastContainer from '@components/ui/toast'
import Navbar from '@components/layout/navbar'
import AuthPage from '@pages/authPage'
import HomePage from '@pages/homePage'
import useAuth from '@hooks/useAuth'

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }
  return <>{children}</>
}

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

const AppLayout = ({ children }: { children: ReactNode }) => {
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

export const Router = () => {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <PageContainer>
                  <HomePage />
                </PageContainer>
              </ProtectedRoute>
            }
          />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <PageContainer center>
                  <AuthPage />
                </PageContainer>
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PageContainer center>
                <ResetPasswordPage />
              </PageContainer>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default Router
