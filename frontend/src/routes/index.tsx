import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { ProtectedRoute, PublicRoute, AppLayout } from './components'
import PageContainer from '@components/layout/pageContainer'
import TermsOfServicePage from '@pages/termsOfService'
import PrivacyPolicyPage from '@pages/privacyPolicy'
import ResetPasswordPage from '@pages/resetPassword'
import HabitsPage from '@pages/habits'
import ProfilePage from '@pages/profile'
import AuthPage from '@pages/auth'

import type { RouteItem } from './types'

const routes: RouteItem[] = [
  {
    path: '/',
    component: HabitsPage,
    protected: true
  },
  {
    path: '/profile',
    component: ProfilePage,
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
  },
  {
    path: '/privacy',
    component: PrivacyPolicyPage
  },
  {
    path: '/terms',
    component: TermsOfServicePage
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
          <Route path="/politica-de-privacidade" element={<Navigate to="/privacy" replace />} />
          <Route path="/termos-de-servico" element={<Navigate to="/terms" replace />} />
          <Route path="/habits" element={<Navigate to="/" replace />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default Router
