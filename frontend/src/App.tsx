import { AuthProvider } from './context/auth'
import { ToastProvider } from './context/toast'
import { useAuth } from './hooks/useAuth'
import { Navbar } from './components/layout/Navbar'
import { PageContainer } from './components/layout/PageContainer'
import { ToastContainer } from './components/ui/Toast'
import { AuthPage } from './pages/AuthPage'
import { HomePage } from './pages/HomePage'

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px'
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            border: '3px solid rgba(99, 102, 241, 0.2)',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}
        />
        <style>
          {`@keyframes spin { to { transform: rotate(360deg); } }`}
        </style>
      </div>
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

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
