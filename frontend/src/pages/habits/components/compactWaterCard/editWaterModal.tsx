import { useState } from 'react'
import { Box, Group, Stack, Text, UnstyledButton } from '@mantine/core'
import { TbDropletFilled, TbBottle, TbSparkles } from 'react-icons/tb'

import Modal from '@components/ui/modal'
import Input from '@components/ui/input'
import Button from '@components/ui/button'
import { calculateIdealWaterMl } from '@stores/health/utils'

interface EditWaterModalProps {
  opened: boolean
  onClose: () => void
  currentWeight?: number
  currentAge?: number
  currentHeight?: number
  currentBottleMl: number
  currentTargetBottles: number
  onSave: (settings: { bottleMl: number; targetBottles: number }) => void
}

const PRESET_BOTTLE_SIZES = [250, 300, 500, 600, 750, 1000]

interface EditWaterFormProps {
  currentWeight?: number
  currentAge?: number
  currentHeight?: number
  currentBottleMl: number
  currentTargetBottles: number
  onClose: () => void
  onSave: (settings: { bottleMl: number; targetBottles: number }) => void
}

const EditWaterForm = ({
  currentWeight,
  currentAge,
  currentHeight,
  currentBottleMl,
  currentTargetBottles,
  onClose,
  onSave
}: EditWaterFormProps) => {
  const [bottleMl, setBottleMl] = useState<number>(currentBottleMl || 500)
  const [targetBottles, setTargetBottles] = useState<number>(currentTargetBottles || 5)

  // Cálculo da recomendação científica personalizada conforme peso, idade e altura
  const idealDailyMl = calculateIdealWaterMl(currentWeight, currentAge, currentHeight)
  const idealBottlesForSelectedSize = Math.max(1, Math.ceil(idealDailyMl / (bottleMl || 500)))

  const totalDailyMl = Math.max(0, bottleMl * targetBottles)
  const totalLiters = (totalDailyMl / 1000).toFixed(1)

  const handleSelectSize = (size: number) => {
    setBottleMl(size)
    // Atualiza automaticamente a quantidade de garrafas para a meta ideal daquele volume
    const newIdealBottles = Math.max(1, Math.ceil(idealDailyMl / size))
    setTargetBottles(newIdealBottles)
  }

  const handleApplyIdeal = () => {
    setTargetBottles(idealBottlesForSelectedSize)
  }

  const handleSave = () => {
    const validMl = Math.max(50, Math.min(3000, Number(bottleMl) || 500))
    const validCount = Math.max(1, Math.min(30, Number(targetBottles) || 5))
    onSave({ bottleMl: validMl, targetBottles: validCount })
    onClose()
  }

  return (
    <Stack gap="md">
      {/* Banner de Recomendação Baseada no Perfil Físico */}
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
              Recomendação pelo seu Perfil
            </Text>
          </Group>
          <Text size="10px" c="dimmed">
            {currentWeight ? `${currentWeight}kg` : '--'} • {currentAge ? `${currentAge} anos` : '--'} • {currentHeight ? `${currentHeight}cm` : '--'}
          </Text>
        </Group>

        <Group justify="space-between" align="baseline" mt={4}>
          <Text size="xs" c="dimmed">
            Meta ideal estimada:
          </Text>
          <Text size="xs" fw={700} c="white">
            {idealDailyMl.toLocaleString()}ml/dia ({idealBottlesForSelectedSize} garrafas de {bottleMl}ml)
          </Text>
        </Group>
      </Box>

      {/* Campo 1: Volume de cada garrafinha */}
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
            setTargetBottles(Math.max(1, Math.ceil(idealDailyMl / val)))
          }}
          min={50}
          max={3000}
          step={50}
          leftIcon={<TbBottle size={16} />}
        />

        {/* Atalhos rápidos para tamanhos comuns com recálculo automático da meta ideal */}
        <Group gap={6} mt={8}>
          {PRESET_BOTTLE_SIZES.map((size) => {
            const isSelected = bottleMl === size
            return (
              <UnstyledButton
                key={size}
                onClick={() => handleSelectSize(size)}
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
        <Group justify="space-between" align="center" mb={6}>
          <Text size="xs" fw={600} c="dimmed">
            Meta diária de garrafas
          </Text>
          {targetBottles !== idealBottlesForSelectedSize && (
            <UnstyledButton
              onClick={handleApplyIdeal}
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: '#38bdf8',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Usar ideal ({idealBottlesForSelectedSize} garrafas)
            </UnstyledButton>
          )}
        </Group>

        <Input
          type="number"
          value={targetBottles}
          onChange={(e) => setTargetBottles(Math.max(1, Number(e.target.value)))}
          min={1}
          max={30}
          step={1}
          leftIcon={<TbDropletFilled size={15} color="#c084fc" />}
        />
      </Box>

      {/* Resumo da Meta Diária */}
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
          Meta diária total:
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
  currentWeight,
  currentAge,
  currentHeight,
  currentBottleMl,
  currentTargetBottles,
  onSave
}: EditWaterModalProps) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Configurar Hidratação"
      description="Personalize o volume da garrafinha e a meta diária calculada para seu perfil."
      variant="indigo"
      size="sm"
    >
      {opened && (
        <EditWaterForm
          currentWeight={currentWeight}
          currentAge={currentAge}
          currentHeight={currentHeight}
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
