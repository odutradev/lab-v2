import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mantine/core'
import type { ComponentType, ReactNode } from 'react'

import PageContainer from '@components/layout/pageContainer'
import ResetPasswordPage from '@pages/resetPasswordPage'
import ToastContainer from '@components/ui/toast'
import Navbar from '@components/layout/navbar'
import AuthPage from '@pages/authPage'
import HomePage from '@pages/homePage'
import useAuth from '@hooks/useAuth'

interface RouteItem {
  path: string
  component: ComponentType
  protected?: boolean
  publicOnly?: boolean
  center?: boolean
}

const routes: RouteItem[] = [
  {
    path: '/',
    component: HomePage,
    protected: true
  },
  {
    path: '/auth',
    component: AuthPage,
    publicOnly: true,
    center: true
  },
  {
    path: '/reset-password',
    component: ResetPasswordPage,
    center: true
  }
]

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

const renderRouteElement = (route: RouteItem) => {
  const Component = route.component
  const content = (
    <PageContainer center={route.center}>
      <Component />
    </PageContainer>
  )

  if (route.protected) {
    return <ProtectedRoute>{content}</ProtectedRoute>
  }

  if (route.publicOnly) {
    return <PublicRoute>{content}</PublicRoute>
  }

  return content
}

export const Router = () => {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={renderRouteElement(route)}
            />
          ))}
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default Router
