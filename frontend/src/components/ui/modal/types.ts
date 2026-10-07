import type { ReactNode } from 'react'

export type ModalType = 'default' | 'confirm' | 'actionChoice'

export type ModalVariant = 'indigo' | 'danger' | 'warning' | 'info' | 'success'

export interface ModalActionOption {
  key: string
  title: string
  description?: string
  icon?: ReactNode
  variant?: 'primary' | 'danger' | 'outline' | 'ghost' | 'secondary'
  isLoading?: boolean
  disabled?: boolean
  onClick: () => void | Promise<void>
}

export interface ModalProps {
  opened: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  type?: ModalType
  variant?: ModalVariant
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string | number
  children?: ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
  isConfirmLoading?: boolean
  actions?: ModalActionOption[]
  footer?: ReactNode
  closeOnClickOutside?: boolean
  closeOnEscape?: boolean
  centered?: boolean
  withCloseButton?: boolean
}

export interface ModalHeaderProps {
  children?: ReactNode
  title?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  variant?: ModalVariant
  onClose?: () => void
}

export interface ModalBodyProps {
  children?: ReactNode
}

export interface ModalFooterProps {
  children?: ReactNode
}
