import { Modal as MantineModal, Box, Title, Text, Group, Stack, ThemeIcon, UnstyledButton } from '@mantine/core'
import { TbAlertTriangle, TbAlertCircle, TbCheck, TbInfoCircle, TbChevronRight } from 'react-icons/tb'

import Button from '@components/ui/button'

import type { ModalProps, ModalHeaderProps, ModalBodyProps, ModalFooterProps, ModalVariant } from './types'

const variantColors: Record<ModalVariant, string> = {
  indigo: 'indigo',
  danger: 'red',
  warning: 'yellow',
  info: 'blue',
  success: 'teal'
}

const renderVariantIcon = (variant: ModalVariant) => {
  switch (variant) {
    case 'danger':
      return <TbAlertCircle size={22} />
    case 'warning':
      return <TbAlertTriangle size={22} />
    case 'success':
      return <TbCheck size={22} />
    case 'info':
    case 'indigo':
    default:
      return <TbInfoCircle size={22} />
  }
}

export const ModalHeader = ({ title, description, icon, variant = 'indigo' }: ModalHeaderProps) => {
  const color = variantColors[variant]

  return (
    <Box mb="md" pb="xs" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <Group gap="sm" align="flex-start" wrap="nowrap">
        {icon || (
          <ThemeIcon size="lg" radius="md" variant="light" color={color}>
            {renderVariantIcon(variant)}
          </ThemeIcon>
        )}
        <Box style={{ flex: 1 }}>
          {typeof title === 'string' ? (
            <Title order={4} fw={600} c="white">
              {title}
            </Title>
          ) : (
            title
          )}
          {description && (
            <Text size="sm" c="dimmed" mt={4}>
              {description}
            </Text>
          )}
        </Box>
      </Group>
    </Box>
  )
}

export const ModalBody = ({ children }: ModalBodyProps) => {
  return <Box py="xs">{children}</Box>
}

export const ModalFooter = ({ children }: ModalFooterProps) => {
  return (
    <Box mt="lg" pt="md" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <Group justify="flex-end" gap="sm">
        {children}
      </Group>
    </Box>
  )
}

export const Modal = ({
  opened,
  onClose,
  title,
  description,
  type = 'default',
  variant = 'indigo',
  size = 'md',
  children,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  isConfirmLoading = false,
  actions = [],
  footer,
  closeOnClickOutside = true,
  closeOnEscape = true,
  centered = true,
  withCloseButton = true
}: ModalProps) => {
  const buttonVariant = variant === 'danger' ? 'danger' : 'primary'

  return (
    <MantineModal
      opened={opened}
      onClose={onClose}
      centered={centered}
      size={size}
      withCloseButton={withCloseButton}
      closeOnClickOutside={closeOnClickOutside}
      closeOnEscape={closeOnEscape}
      styles={{
        content: {
          background: 'linear-gradient(180deg, rgba(26, 28, 43, 0.98) 0%, rgba(16, 17, 26, 0.99) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 16,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(16px)',
          padding: '24px'
        },
        header: {
          background: 'transparent',
          padding: 0,
          marginBottom: title || description ? 16 : 0
        },
        body: {
          padding: 0
        },
        close: {
          color: 'rgba(255, 255, 255, 0.5)',
          transition: 'all 0.2s ease',
          '&:hover': {
            color: '#fff',
            backgroundColor: 'rgba(255, 255, 255, 0.08)'
          }
        }
      }}
    >
      {(title || description) && (
        <ModalHeader
          title={title}
          description={description}
          variant={variant}
        />
      )}

      {type === 'confirm' && (
        <>
          <ModalBody>
            {children && <Box mb="md">{children}</Box>}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose} disabled={isConfirmLoading}>
              {cancelText}
            </Button>
            <Button
              variant={buttonVariant}
              onClick={onConfirm}
              isLoading={isConfirmLoading}
            >
              {confirmText}
            </Button>
          </ModalFooter>
        </>
      )}

      {type === 'actionChoice' && (
        <>
          <ModalBody>
            {children && <Box mb="md">{children}</Box>}
            <Stack gap="sm">
              {actions.map((action) => (
                <UnstyledButton
                  key={action.key}
                  onClick={action.onClick}
                  disabled={action.disabled || action.isLoading}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 12,
                    background: action.variant === 'danger'
                      ? 'rgba(239, 68, 68, 0.08)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: action.variant === 'danger'
                      ? '1px solid rgba(239, 68, 68, 0.25)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.2s ease',
                    cursor: action.disabled ? 'not-allowed' : 'pointer',
                    opacity: action.disabled ? 0.6 : 1
                  }}
                >
                  <Group justify="space-between" align="center" wrap="nowrap">
                    <Group gap="md" wrap="nowrap" align="center" style={{ flex: 1 }}>
                      {action.icon && (
                        <ThemeIcon
                          size="lg"
                          radius="md"
                          variant="light"
                          color={action.variant === 'danger' ? 'red' : 'indigo'}
                        >
                          {action.icon}
                        </ThemeIcon>
                      )}
                      <Box style={{ flex: 1 }}>
                        <Text
                          size="sm"
                          fw={600}
                          c={action.variant === 'danger' ? 'red.4' : 'white'}
                        >
                          {action.title}
                        </Text>
                        {action.description && (
                          <Text size="xs" c="dimmed" mt={2}>
                            {action.description}
                          </Text>
                        )}
                      </Box>
                    </Group>
                    <TbChevronRight size={18} color="rgba(255, 255, 255, 0.4)" />
                  </Group>
                </UnstyledButton>
              ))}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" fullWidth onClick={onClose}>
              {cancelText}
            </Button>
          </ModalFooter>
        </>
      )}

      {type === 'default' && (
        <>
          <ModalBody>{children}</ModalBody>
          {footer && <ModalFooter>{footer}</ModalFooter>}
        </>
      )}
    </MantineModal>
  )
}

Modal.Header = ModalHeader
Modal.Body = ModalBody
Modal.Footer = ModalFooter

export default Modal
