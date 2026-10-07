import { Modal, Stack, Group, Radio } from '@mantine/core'
import { useState } from 'react'

import Button from '@components/ui/button'

import type { RecurringScopeModalProps } from './types'
import type { RecurrenceScopeMode } from '@actions/habits/types'

export const RecurringScopeModal = ({
  isOpen,
  actionType,
  onClose,
  onConfirm,
  isLoading
}: RecurringScopeModalProps) => {
  const [selectedMode, setSelectedMode] = useState<RecurrenceScopeMode>('this')

  const title = actionType === 'delete' ? 'Excluir meta recorrente' : 'Editar meta recorrente'

  const handleClose = () => {
    setSelectedMode('this')
    onClose()
  }

  const handleConfirm = () => {
    onConfirm(selectedMode)
    setSelectedMode('this')
  }

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      title={title}
      centered
      radius="lg"
      size="xs"
      styles={{
        content: {
          backgroundColor: '#1f1f1f',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.65)',
          color: '#e3e3e3'
        },
        header: {
          backgroundColor: '#1f1f1f',
          borderBottom: 'none',
          paddingBottom: 4
        },
        title: {
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '1.15rem'
        }
      }}
    >
      <Stack gap="lg" mt="xs">
        <Radio.Group
          value={selectedMode}
          onChange={(val) => setSelectedMode(val as RecurrenceScopeMode)}
        >
          <Stack gap="md">
            <Radio
              value="this"
              label="Esta ocorrência"
              styles={{
                label: { color: '#e3e3e3', fontSize: 14, cursor: 'pointer' },
                radio: { cursor: 'pointer' }
              }}
            />
            <Radio
              value="following"
              label="Esta e as ocorrências seguintes"
              styles={{
                label: { color: '#e3e3e3', fontSize: 14, cursor: 'pointer' },
                radio: { cursor: 'pointer' }
              }}
            />
            <Radio
              value="all"
              label="Todas as ocorrências"
              styles={{
                label: { color: '#e3e3e3', fontSize: 14, cursor: 'pointer' },
                radio: { cursor: 'pointer' }
              }}
            />
          </Stack>
        </Radio.Group>

        <Group justify="flex-end" gap="sm" mt="xs">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            isLoading={isLoading}
            style={{
              backgroundColor: '#a8c7fa',
              color: '#041e49',
              borderRadius: 20,
              fontWeight: 600,
              paddingLeft: 22,
              paddingRight: 22
            }}
          >
            OK
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

export default RecurringScopeModal
