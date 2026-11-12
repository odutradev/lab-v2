import { Modal, Stack, Group, Radio, alpha } from '@mantine/core'
import { useState } from 'react'

import Button from '@components/button'

import type { RecurringScopeModalProps } from './types'
import type { RecurrenceScopeMode } from '@actions/habits/types'
import { colors } from '@styles/theme'

export const RecurringScopeModal = ({
  isOpen,
  actionType,
  onClose,
  onConfirm,
  isLoading
}: RecurringScopeModalProps) => {
  const [selectedMode, setSelectedMode] = useState<RecurrenceScopeMode>('this')

  const title = actionType === 'delete' ? 'Excluir item recorrente' : 'Editar item recorrente'

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
          backgroundColor: colors.graphite900,
          border: `1px solid ${alpha(colors.white, 0.1)}`,
          boxShadow: `0 20px 40px ${alpha(colors.black, 0.65)}`,
          color: colors.mist200
        },
        header: {
          backgroundColor: colors.graphite900,
          borderBottom: 'none',
          paddingBottom: 4
        },
        title: {
          color: colors.white,
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
                label: { color: colors.mist200, fontSize: 14, cursor: 'pointer' },
                radio: { cursor: 'pointer' }
              }}
            />
            <Radio
              value="following"
              label="Esta e as ocorrências seguintes"
              styles={{
                label: { color: colors.mist200, fontSize: 14, cursor: 'pointer' },
                radio: { cursor: 'pointer' }
              }}
            />
            <Radio
              value="all"
              label="Todas as ocorrências"
              styles={{
                label: { color: colors.mist200, fontSize: 14, cursor: 'pointer' },
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
              backgroundColor: colors.periwinkle200,
              color: colors.navy900,
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
