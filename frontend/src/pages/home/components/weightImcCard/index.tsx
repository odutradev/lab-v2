import { useState, useMemo, useEffect } from 'react'
import {
  Stack,
  Group,
  Text,
  NumberInput,
  Box,
  Badge as MantineBadge,
  ThemeIcon
} from '@mantine/core'
import {
  TbScale,
  TbCheck,
  TbPencil,
  TbArrowUpRight,
  TbArrowDownRight,
  TbX
} from 'react-icons/tb'

import Card, { CardHeader, CardTitle, CardContent } from '@components/ui/card'
import Button from '@components/ui/button'
import ActionIcon from '@components/ui/actionIcon'
import useToastStore from '@stores/toast'
import { calculateImc, getTodayDateString, formatDateDisplay } from '@stores/health/utils'
import { WeightHistoryChart } from './weightHistoryChart'
import { ImcGaugeChart } from './imcGaugeChart'
import type { WeightImcCardProps } from './types'

export const WeightImcCard = ({
  heightCm,
  weightHistory,
  onSaveWeight,
  onOpenPhysicalModal
}: WeightImcCardProps) => {
  const { showToast } = useToastStore()
  const todayStr = getTodayDateString()

  // Verifica se já registrou peso hoje
  const todayRecord = useMemo(
    () => weightHistory.find((r) => r.date === todayStr),
    [weightHistory, todayStr]
  )

  const latestRecord = useMemo(() => {
    if (weightHistory.length === 0) return null
    return weightHistory[weightHistory.length - 1]
  }, [weightHistory])

  // Estado para controlar se está no modo de edição do check-in
  const [isEditing, setIsEditing] = useState(false)
  const [inputWeight, setInputWeight] = useState<number | string>(
    todayRecord ? todayRecord.weight : latestRecord ? latestRecord.weight : ''
  )

  // Sincroniza input quando registro muda
  useEffect(() => {
    if (!isEditing) {
      setInputWeight(todayRecord ? todayRecord.weight : latestRecord ? latestRecord.weight : '')
    }
  }, [todayRecord, latestRecord, isEditing])

  const imcResult = useMemo(() => {
    const currentWeight = todayRecord?.weight || latestRecord?.weight
    return calculateImc(currentWeight, heightCm)
  }, [todayRecord, latestRecord, heightCm])

  // Variação em relação ao registro anterior
  const weightDifference = useMemo(() => {
    if (weightHistory.length < 2) return null
    const latest = weightHistory[weightHistory.length - 1].weight
    const previous = weightHistory[weightHistory.length - 2].weight
    return Math.round((latest - previous) * 10) / 10
  }, [weightHistory])

  const handleStartEdit = () => {
    setInputWeight(todayRecord ? todayRecord.weight : latestRecord ? latestRecord.weight : '')
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setInputWeight(todayRecord ? todayRecord.weight : latestRecord ? latestRecord.weight : '')
  }

  const handleSave = () => {
    const weightNum = Number(inputWeight)
    if (!weightNum || isNaN(weightNum) || weightNum < 25 || weightNum > 350) {
      showToast('Por favor, informe um peso válido entre 25 kg e 350 kg.', 'error')
      return
    }

    onSaveWeight(weightNum, todayStr)
    setIsEditing(false)
    showToast(
      todayRecord
        ? `Check-in de hoje atualizado para ${weightNum.toFixed(1)} kg!`
        : `Check-in de hoje registrado com sucesso: ${weightNum.toFixed(1)} kg!`,
      'success'
    )
  }

  return (
    <Card style={{ position: 'relative', overflow: 'hidden' }}>
      <CardHeader>
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap={8} align="center">
            <ThemeIcon
              size="sm"
              radius="md"
              variant="light"
              color={todayRecord ? 'teal' : 'indigo'}
              style={{
                backgroundColor: todayRecord ? 'rgba(34, 197, 94, 0.15)' : 'rgba(99, 102, 241, 0.15)'
              }}
            >
              <TbScale size={16} color={todayRecord ? '#4ade80' : '#818cf8'} />
            </ThemeIcon>
            <CardTitle style={{ fontSize: '15px', fontWeight: 700 }}>Peso Corporal</CardTitle>
            <MantineBadge
              size="xs"
              variant="outline"
              color={todayRecord ? 'teal' : 'gray'}
            >
              {formatDateDisplay(todayStr)}
            </MantineBadge>
          </Group>

          <Group gap={6} align="center">
            {weightDifference !== null && (
              <MantineBadge
                size="xs"
                variant="light"
                color={weightDifference > 0 ? 'orange' : weightDifference < 0 ? 'teal' : 'gray'}
                leftSection={
                  weightDifference > 0 ? (
                    <TbArrowUpRight size={12} />
                  ) : (
                    <TbArrowDownRight size={12} />
                  )
                }
              >
                {weightDifference > 0 ? `+${weightDifference}` : `${weightDifference}`} kg
              </MantineBadge>
            )}

            <MantineBadge
              size="xs"
              variant={todayRecord ? 'filled' : 'light'}
              color={todayRecord ? 'teal' : 'yellow'}
              leftSection={todayRecord ? <TbCheck size={11} /> : undefined}
            >
              {todayRecord ? 'Check-in Feito' : 'Check-in Pendente'}
            </MantineBadge>
          </Group>
        </Group>
      </CardHeader>

      <CardContent>
        <Stack gap="md">
          {/* Módulo de Check-in do Dia (Interativo / Clique para Editar) */}
          <Box
            style={{
              borderRadius: 10,
              background: todayRecord
                ? 'rgba(34, 197, 94, 0.04)'
                : 'rgba(99, 102, 241, 0.04)',
              border: `1px solid ${
                isEditing
                  ? 'rgba(99, 102, 241, 0.4)'
                  : todayRecord
                    ? 'rgba(34, 197, 94, 0.18)'
                    : 'rgba(99, 102, 241, 0.18)'
              }`,
              padding: '12px 14px',
              transition: 'all 0.2s ease',
              cursor: isEditing ? 'default' : 'pointer'
            }}
            onClick={!isEditing ? handleStartEdit : undefined}
          >
            {!isEditing ? (
              <Group justify="space-between" align="center" wrap="nowrap">
                <Group gap="sm" align="center">
                  <ThemeIcon
                    size="lg"
                    radius="xl"
                    variant={todayRecord ? 'filled' : 'light'}
                    color={todayRecord ? 'teal' : 'indigo'}
                  >
                    {todayRecord ? <TbCheck size={18} /> : <TbScale size={18} />}
                  </ThemeIcon>

                  <Box>
                    <Group gap={6} align="center">
                      <Text size="xs" fw={700} c="white">
                        {todayRecord ? 'Check-in de Hoje' : 'Check-in do Dia'}
                      </Text>
                      <Text size="11px" c={todayRecord ? '#4ade80' : '#fbbf24'} fw={600}>
                        • {todayRecord ? 'Concluído' : 'Pendente'}
                      </Text>
                    </Group>

                    <Text size="11px" c="dimmed">
                      {todayRecord
                        ? 'Clique para editar seu peso registrado hoje'
                        : 'Clique para registrar seu peso de hoje'}
                    </Text>
                  </Box>
                </Group>

                <Group gap="sm" align="center">
                  {todayRecord ? (
                    <Text size="20px" fw={800} c="#4ade80" style={{ lineHeight: 1 }}>
                      {todayRecord.weight.toFixed(1)}{' '}
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                        kg
                      </span>
                    </Text>
                  ) : latestRecord ? (
                    <Text size="xs" c="dimmed">
                      Último:{' '}
                      <span style={{ color: '#fff', fontWeight: 600 }}>
                        {latestRecord.weight.toFixed(1)} kg
                      </span>
                    </Text>
                  ) : null}

                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    color="gray"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStartEdit()
                    }}
                    title={todayRecord ? 'Editar peso de hoje' : 'Fazer check-in de hoje'}
                  >
                    <TbPencil size={15} />
                  </ActionIcon>
                </Group>
              </Group>
            ) : (
              <Box>
                <Group justify="space-between" align="center" mb="xs">
                  <Text size="xs" fw={700} c="white">
                    {todayRecord ? 'Editar Check-in de Hoje' : 'Realizar Check-in de Hoje'}
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    size="xs"
                    color="gray"
                    onClick={handleCancelEdit}
                    title="Cancelar"
                  >
                    <TbX size={14} />
                  </ActionIcon>
                </Group>

                <Group gap="xs" align="center">
                  <Box style={{ flex: 1 }}>
                    <NumberInput
                      autoFocus
                      placeholder="Ex: 75.5"
                      value={inputWeight}
                      onChange={(val) => setInputWeight(typeof val === 'number' ? val : '')}
                      decimalScale={1}
                      step={0.1}
                      min={25}
                      max={350}
                      suffix=" kg"
                      size="xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave()
                        if (e.key === 'Escape') handleCancelEdit()
                      }}
                      styles={{
                        input: {
                          backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          borderColor: 'rgba(255, 255, 255, 0.15)',
                          color: '#fff',
                          fontWeight: 700,
                          height: 34
                        }
                      }}
                    />
                  </Box>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSave}
                    leftIcon={<TbCheck size={14} />}
                    style={{ height: 34 }}
                  >
                    Salvar
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                    style={{ height: 34 }}
                  >
                    Cancelar
                  </Button>
                </Group>
              </Box>
            )}
          </Box>

          {/* Gráfico Minimalista indicando o peso do dia */}
          <WeightHistoryChart records={weightHistory} height={heightCm} />

          {/* Medidor Minimalista de IMC */}
          <ImcGaugeChart
            imcResult={imcResult}
            heightCm={heightCm}
            currentWeight={todayRecord?.weight || latestRecord?.weight}
            onConfigureHeight={onOpenPhysicalModal}
          />
        </Stack>
      </CardContent>
    </Card>
  )
}

export default WeightImcCard
