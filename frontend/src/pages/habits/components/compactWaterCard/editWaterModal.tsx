import { useState } from 'react'
import { Box, Group, Stack, Text, UnstyledButton } from '@mantine/core'
import { TbDropletFilled, TbBottle } from 'react-icons/tb'

import Modal from '@components/ui/modal'
import Input from '@components/ui/input'
import Button from '@components/ui/button'

interface EditWaterModalProps {
  opened: boolean
  onClose: () => void
  currentBottleMl: number
  currentTargetBottles: number
  onSave: (settings: { bottleMl: number; targetBottles: number }) => void
}

const PRESET_BOTTLE_SIZES = [250, 300, 500, 600, 750, 1000]
const PRESET_BOTTLE_COUNTS = [3, 4, 5, 6, 8]

interface EditWaterFormProps {
  currentBottleMl: number
  currentTargetBottles: number
  onClose: () => void
  onSave: (settings: { bottleMl: number; targetBottles: number }) => void
}

const EditWaterForm = ({
  currentBottleMl,
  currentTargetBottles,
  onClose,
  onSave
}: EditWaterFormProps) => {
  const [bottleMl, setBottleMl] = useState<number>(currentBottleMl || 500)
  const [targetBottles, setTargetBottles] = useState<number>(currentTargetBottles || 5)

  const totalDailyMl = Math.max(0, bottleMl * targetBottles)
  const totalLiters = (totalDailyMl / 1000).toFixed(1)

  const handleSave = () => {
    const validMl = Math.max(50, Math.min(3000, Number(bottleMl) || 500))
    const validCount = Math.max(1, Math.min(30, Number(targetBottles) || 5))
    onSave({ bottleMl: validMl, targetBottles: validCount })
    onClose()
  }

  return (
    <Stack gap="md">
      {/* Campo 1: Volume de cada garrafinha */}
      <Box>
        <Text size="xs" fw={600} c="dimmed" mb={6}>
          Volume por garrafa (ml)
        </Text>
        <Input
          type="number"
          value={bottleMl}
          onChange={(e) => setBottleMl(Math.max(1, Number(e.target.value)))}
          min={50}
          max={3000}
          step={50}
          leftIcon={<TbBottle size={16} />}
        />

        {/* Atalhos rápidos para tamanhos comuns */}
        <Group gap={6} mt={8}>
          {PRESET_BOTTLE_SIZES.map((size) => {
            const isSelected = bottleMl === size
            return (
              <UnstyledButton
                key={size}
                onClick={() => setBottleMl(size)}
                style={{
                  padding: '3px 8px',
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

      {/* Campo 2: Quantidade de garrafas da meta */}
      <Box>
        <Text size="xs" fw={600} c="dimmed" mb={6}>
          Meta diária de garrafas
        </Text>
        <Input
          type="number"
          value={targetBottles}
          onChange={(e) => setTargetBottles(Math.max(1, Number(e.target.value)))}
          min={1}
          max={30}
          step={1}
          leftIcon={<TbDropletFilled size={15} color="#c084fc" />}
        />

        {/* Atalhos rápidos para quantidade */}
        <Group gap={6} mt={8}>
          {PRESET_BOTTLE_COUNTS.map((count) => {
            const isSelected = targetBottles === count
            return (
              <UnstyledButton
                key={count}
                onClick={() => setTargetBottles(count)}
                style={{
                  padding: '3px 10px',
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
                {count} garrafas
              </UnstyledButton>
            )
          })}
        </Group>
      </Box>

      {/* Resumo da Meta */}
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
          Meta Total:
        </Text>
        <Text size="xs" fw={700} c="#c084fc">
          {targetBottles} × {bottleMl}ml = {totalDailyMl.toLocaleString()}ml ({totalLiters}L)
        </Text>
      </Box>

      {/* Rodapé com Ações */}
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
  currentBottleMl,
  currentTargetBottles,
  onSave
}: EditWaterModalProps) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Configurar Hidratação"
      description="Personalize o volume da garrafinha e a meta diária."
      variant="indigo"
      size="sm"
    >
      {opened && (
        <EditWaterForm
          currentBottleMl={currentBottleMl}
          currentTargetBottles={currentTargetBottles}
          onClose={onClose}
          onSave={onSave}
        />
      )}
    </Modal>
  )
}

export default EditWaterModal
