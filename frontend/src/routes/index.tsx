import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import PageContainer from '@components/layout/pageContainer'
import ResetPasswordPage from '@pages/resetPasswordPage'
import AuthPage from '@pages/authPage'
import HomePage from '@pages/homePage'

import { ProtectedRoute, PublicRoute, AppLayout } from './components'
import type { RouteItem } from './types'

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
