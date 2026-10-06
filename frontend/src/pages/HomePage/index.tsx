import { useState } from 'react'
import { Shield, Activity, Layers, RefreshCw } from 'lucide-react'

import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@components/ui/Card'
import { getProfileAction } from '@actions/users/profile'
import Button from '@components/ui/Button'
import Badge from '@components/ui/Badge'
import useToast from '@hooks/useToast'
import useAuth from '@hooks/useAuth'

import styles from './HomePage.module.css'

export const HomePage = () => {
  const { user, token, refreshUser } = useAuth()
  const { showToast } = useToast()
  const [actionLoading, setActionLoading] = useState(false)
  const [actionResult, setActionResult] = useState<string | null>(null)

  const handleFetchProfile = async () => {
    setActionLoading(true)
    try {
      const data = await getProfileAction()
      setActionResult(JSON.stringify(data, null, 2))
      await refreshUser()
      showToast('Perfil atualizado via getProfileAction()', 'success')
    } catch (err: unknown) {
      const errorMsg = (err as Error)?.message || 'Falha ao buscar perfil'
      setActionResult(`Erro: ${errorMsg}`)
      showToast(errorMsg, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <section className={styles.welcomeCard}>
        <div className={styles.welcomeLeft}>
          <h1 className={styles.welcomeTitle}>Olá, {user?.name}!</h1>
          <p className={styles.welcomeSubtitle}>
            Bem-vindo ao painel principal da plataforma LAB. Sua sessão está ativa e autenticada.
          </p>
          <div className={styles.welcomeBadges}>
            {user?.isOwner && <Badge variant="primary">Proprietário</Badge>}
            {user?.isTenant && <Badge variant="info">Inquilino</Badge>}
            <Badge variant="success">Autenticado</Badge>
          </div>
        </div>
      </section>

      <div className={styles.grid}>
        <Card>
          <CardHeader>
            <CardTitle>Dados do Perfil</CardTitle>
            <CardDescription>Informações cadastrais obtidas do domínio de usuários</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.detailsList}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Nome</span>
                <span className={styles.detailValue}>{user?.name}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>E-mail</span>
                <span className={styles.detailValue}>{user?.email}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>ID do Usuário</span>
                <span className={styles.detailValue}>{user?.id}</span>
              </div>
              {user?.phone && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Telefone</span>
                  <span className={styles.detailValue}>{user.phone}</span>
                </div>
              )}
              {user?.document && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Documento</span>
                  <span className={styles.detailValue}>{user.document}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Execução de Actions</CardTitle>
            <CardDescription>Executar actions isoladas por domínios (users/profile)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.actionPanel}>
              <div className={styles.actionButtons}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleFetchProfile}
                  isLoading={actionLoading}
                  leftIcon={<RefreshCw size={15} />}
                >
                  getProfileAction()
                </Button>
              </div>

              {actionResult ? (
                <pre className={styles.responseBox}>{actionResult}</pre>
              ) : (
                <div className={styles.responseBox}>
                  Clique acima para disparar a action e inspecionar a resposta da API em tempo real.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={styles.grid}>
        <Card>
          <CardContent>
            <div className={styles.statusCard}>
              <div className={styles.statusIcon}>
                <Shield size={22} />
              </div>
              <div className={styles.statusInfo}>
                <span className={styles.statusTitle}>Token de Acesso</span>
                <span className={styles.statusValue}>
                  {token ? 'JWT Válido' : 'Não encontrado'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className={styles.statusCard}>
              <div className={styles.statusIcon}>
                <Layers size={22} />
              </div>
              <div className={styles.statusInfo}>
                <span className={styles.statusTitle}>Arquitetura de Actions</span>
                <span className={styles.statusValue}>Domínio users Ativo</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className={styles.statusCard}>
              <div className={styles.statusIcon}>
                <Activity size={22} />
              </div>
              <div className={styles.statusInfo}>
                <span className={styles.statusTitle}>Estado da Aplicação</span>
                <span className={styles.statusValue}>Online & Pronto</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default HomePage
