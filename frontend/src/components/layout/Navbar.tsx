import { LogOut, Layers } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button/Button'
import { Badge } from '../ui/Badge/Badge'
import styles from './Navbar.module.css'

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()

  const getRoleLabel = () => {
    if (!user) return ''
    if (user.isOwner && user.isTenant) return 'Proprietário & Inquilino'
    if (user.isOwner) return 'Proprietário'
    if (user.isTenant) return 'Inquilino'
    return 'Usuário'
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.brandBadge}>
            <Layers size={18} />
          </div>
          <span className={styles.brandText}>LAB Portal</span>
        </div>

        {isAuthenticated && user && (
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>{getInitials(user.name)}</div>
              <div className={styles.userMeta}>
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.userRole}>
                  <Badge variant={user.isOwner ? 'primary' : 'info'}>
                    {getRoleLabel()}
                  </Badge>
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              leftIcon={<LogOut size={16} />}
            >
              Sair
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
