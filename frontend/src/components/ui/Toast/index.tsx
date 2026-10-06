import { Check, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { Notification, Stack } from '@mantine/core'

import useToast from '@hooks/useToast'

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check size={18} />
      case 'error':
        return <AlertCircle size={18} />
      case 'warning':
        return <AlertTriangle size={18} />
      case 'info':
      default:
        return <Info size={18} />
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'teal'
      case 'error':
        return 'red'
      case 'warning':
        return 'yellow'
      case 'info':
      default:
        return 'indigo'
    }
  }

  return (
    <Stack
      pos="fixed"
      bottom={24}
      right={24}
      gap="sm"
      style={{ zIndex: 1000, maxWidth: 380, width: 'calc(100% - 48px)' }}
    >
      {toasts.map((toast) => (
        <Notification
          key={toast.id}
          color={getColor(toast.type)}
          icon={getIcon(toast.type)}
          title={toast.title}
          onClose={() => removeToast(toast.id)}
          radius="md"
          withBorder
        >
          {toast.message}
        </Notification>
      ))}
    </Stack>
  )
}

export default ToastContainer
