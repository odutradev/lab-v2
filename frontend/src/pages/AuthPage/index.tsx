import { useState } from 'react'
import { Layers } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { LoginForm } from '../../components/forms/LoginForm'
import { RegisterForm } from '../../components/forms/RegisterForm'
import styles from './AuthPage.module.css'

export const AuthPage = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  return (
    <div className={styles.wrapper}>
      <div className={styles.brandHeader}>
        <div className={styles.logoIcon}>
          <Layers size={28} />
        </div>
        <h1 className={styles.brandTitle}>LAB Portal</h1>
        <p className={styles.brandSubtitle}>
          {activeTab === 'login'
            ? 'Entre com suas credenciais para acessar sua conta'
            : 'Preencha os dados abaixo para criar sua conta'}
        </p>
      </div>

      <Card>
        <CardContent>
          <div className={styles.tabList} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'login'}
              className={`${styles.tabButton} ${activeTab === 'login' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Entrar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'register'}
              className={`${styles.tabButton} ${activeTab === 'register' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('register')}
            >
              Cadastrar
            </button>
          </div>

          {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
        </CardContent>
      </Card>
    </div>
  )
}
