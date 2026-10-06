import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToast } from '../../../hooks/useToast'
import styles from './ToastContainer.module.css'

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} />
      case 'error':
        return <AlertCircle size={18} />
      case 'warning':
        return <AlertTriangle size={18} />
      case 'info':
      default:
        return <Info size={18} />
    }
  }

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type]}`}
        >
          <div className={styles.iconWrapper}>{getIcon(toast.type)}</div>
          <div className={styles.content}>
            {toast.title && <span className={styles.title}>{toast.title}</span>}
            <span className={styles.message}>{toast.message}</span>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={() => removeToast(toast.id)}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
