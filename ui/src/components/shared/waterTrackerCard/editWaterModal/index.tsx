import { useState } from 'react'
import { Box, Group, Stack, Text, UnstyledButton } from '@mantine/core'
import { TbBottle, TbSparkles } from 'react-icons/tb'

import Modal from '@components/ui/modal'
import Input from '@components/ui/input'
import Button from '@components/ui/button'
import { calculateIdealWaterMl } from '@stores/health/utils'

import type { EditWaterModalProps } from './types'

const PRESET_BOTTLE_SIZES = [500, 600, 750, 1000]

interface EditWaterFormProps {
  currentWeight?: number
  currentAge?: number
  currentHeight?: number
  currentBottleMl: number
  onClose: () => void
  onSave: (settings: { bottleMl: number }) => void
}

const EditWaterForm = ({
  currentWeight,
  currentAge,
  currentHeight,
  currentBottleMl,
  onClose,
  onSave
}: EditWaterFormProps) => {
  const [bottleMl, setBottleMl] = useState<number>(currentBottleMl || 500)

  const idealDailyMl = calculateIdealWaterMl(currentWeight, currentAge, currentHeight)
  const automaticBottles = Math.max(1, Math.ceil(idealDailyMl / (bottleMl || 500)))

  const totalDailyMl = bottleMl * automaticBottles
  const totalLiters = (totalDailyMl / 1000).toFixed(1)

  const handleSelectSize = (size: number) => {
    setBottleMl(size)
  }

  const handleSave = () => {
    const validMl = Math.max(50, Math.min(3000, Number(bottleMl) || 500))
    onSave({ bottleMl: validMl })
    onClose()
  }

  return (
    <Stack gap="md">
      <Box
        style={{
          padding: '10px 12px',
          borderRadius: 8,
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.2)'
        }}
      >
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap={6} align="center">
            <TbSparkles size={14} color="#38bdf8" />
            <Text size="11px" fw={600} c="#38bdf8">
              Cálculo Automático por Perfil
            </Text>
          </Group>
          <Text size="10px" c="dimmed">
            {currentWeight ? `${currentWeight}kg` : '--'} • {currentAge ? `${currentAge} anos` : '--'} • {currentHeight ? `${currentHeight}cm` : '--'}
          </Text>
        </Group>

        <Group justify="space-between" align="baseline" mt={4}>
          <Text size="xs" c="dimmed">
            Necessidade ideal:
          </Text>
          <Text size="xs" fw={700} c="white">
            {idealDailyMl.toLocaleString()}ml / dia
          </Text>
        </Group>
      </Box>

      <Box>
        <Text size="xs" fw={600} c="dimmed" mb={6}>
          Volume por garrafa (ml)
        </Text>
        <Input
          type="number"
          value={bottleMl}
          onChange={(e) => {
            const val = Math.max(1, Number(e.target.value))
            setBottleMl(val)
          }}
          min={50}
          max={3000}
          step={50}
          leftIcon={<TbBottle size={16} />}
        />

        <Group gap={6} mt={8}>
          {PRESET_BOTTLE_SIZES.map((size) => {
            const isSelected = bottleMl === size
            return (
              <UnstyledButton
                key={size}
                onClick={() => handleSelectSize(size)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  background: isSelected ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                  color: isSelected ? '#c084fc' : '#9ca3af',
                  border: isSelected ? '1px solid rgba(168, 85, 247, 0.6)' : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {size}ml
              </UnstyledButton>
            )
          })}
        </Group>
      </Box>

      <Box
        style={{
          padding: '10px 12px',
          borderRadius: 8,
          background: 'rgba(168, 85, 247, 0.08)',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Text size="xs" c="dimmed">
          Meta calculada:
        </Text>
        <Text size="xs" fw={700} c="#c084fc">
          {automaticBottles} garrafas × {bottleMl}ml = {totalDailyMl.toLocaleString()}ml ({totalLiters}L)
        </Text>
      </Box>

      <Group justify="flex-end" gap="sm" mt="xs">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" size="sm" onClick={handleSave}>
          Salvar
        </Button>
      </Group>
    </Stack>
  )
}

export const EditWaterModal = ({
  opened,
  onClose,
  currentWeight,
  currentAge,
  currentHeight,
  currentBottleMl,
  onSave
}: EditWaterModalProps) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Configurar Garrafa"
      description="Informe o tamanho da sua garrafa. A meta de garrafas diárias é calculada automaticamente para o seu corpo."
      variant="indigo"
      size="sm"
    >
      {opened && (
        <EditWaterForm
          currentWeight={currentWeight}
          currentAge={currentAge}
          currentHeight={currentHeight}
          currentBottleMl={currentBottleMl}
          onClose={onClose}
          onSave={onSave}
        />
      )}
    </Modal>
  )
}

export default EditWaterModal
