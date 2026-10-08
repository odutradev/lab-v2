import { useState, useMemo, useEffect } from 'react'
import { Group, Stack, Text, NumberInput, Box, Badge as MantineBadge } from '@mantine/core'
import { TbScale, TbCheck, TbArrowUpRight, TbArrowDownRight } from 'react-icons/tb'

import Card, { CardHeader, CardTitle, CardContent } from '@components/ui/card'
import Button from '@components/ui/button'
import useToastStore from '@stores/toast'
import { calculateImc, getTodayDateString, formatDateDisplay } from '@stores/health/utils'
import type { WeightRecord } from '@stores/health/types'

interface CompactWeightCardProps {
  heightCm?: number
  weightHistory: WeightRecord[]
  selectedDate?: string
  onSaveWeight: (weight: number, date?: string) => void
}

export const CompactWeightCard = ({
  heightCm,
  weightHistory,
  selectedDate,
  onSaveWeight
}: CompactWeightCardProps) => {
  const { showToast } = useToastStore()
  const todayStr = getTodayDateString()
  const activeDate = selectedDate || todayStr
  const isViewingToday = activeDate === todayStr

  const selectedRecord = useMemo(
    () => weightHistory.find((r) => r.date === activeDate),
    [weightHistory, activeDate]
  )

  const latestRecord = useMemo(() => {
    if (weightHistory.length === 0) return null
    return weightHistory[weightHistory.length - 1]
  }, [weightHistory])

  const [inputWeight, setInputWeight] = useState<number | string>(
    selectedRecord ? selectedRecord.weight : ''
  )

  useEffect(() => {
    setInputWeight(selectedRecord ? selectedRecord.weight : '')
  }, [selectedRecord, activeDate])

  const imcResult = useMemo(() => {
    const currentWeight = selectedRecord?.weight || latestRecord?.weight
    return calculateImc(currentWeight, heightCm)
  }, [selectedRecord, latestRecord, heightCm])

  const weightDifference = useMemo(() => {
    if (weightHistory.length < 2) return null
    const latest = weightHistory[weightHistory.length - 1].weight
    const previous = weightHistory[weightHistory.length - 2].weight
    return Math.round((latest - previous) * 10) / 10
  }, [weightHistory])

  const handleSave = () => {
    const weightNum = Number(inputWeight)
    if (!weightNum || isNaN(weightNum) || weightNum < 25 || weightNum > 350) {
      showToast('Informe um peso válido entre 25 kg e 350 kg.', 'error')
      return
    }

    onSaveWeight(weightNum, activeDate)
    const dateLabel = isViewingToday ? 'hoje' : formatDateDisplay(activeDate)
    showToast(
      selectedRecord
        ? `Peso de ${dateLabel} atualizado para ${weightNum.toFixed(1)} kg!`
        : `Peso de ${dateLabel} registrado: ${weightNum.toFixed(1)} kg!`,
      'success'
    )
  }

  return (
    <Card style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Glow suave no topo */}
      <Box
        style={{
          position: 'absolute',
          top: -24,
          right: -24,
          width: 100,
          height: 100,
          background: 'radial-gradient(circle, rgba(163, 230, 53, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <CardHeader style={{ paddingBottom: 6 }}>
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap={6} align="center">
            <TbScale size={18} color="#a3e635" />
            <CardTitle style={{ fontSize: '14px', fontWeight: 700 }}>Peso & IMC</CardTitle>
            <MantineBadge
              size="xs"
              variant={isViewingToday ? 'light' : 'gradient'}
              gradient={!isViewingToday ? { from: 'indigo', to: 'cyan' } : undefined}
              color={isViewingToday ? 'cyan' : undefined}
            >
              {isViewingToday ? 'Hoje' : formatDateDisplay(activeDate)}
            </MantineBadge>
          </Group>

          <Group gap={6}>
            {weightDifference !== null && (
              <MantineBadge
                size="xs"
                variant="light"
                color={weightDifference > 0 ? 'orange' : weightDifference < 0 ? 'teal' : 'gray'}
                leftSection={weightDifference > 0 ? <TbArrowUpRight size={11} /> : <TbArrowDownRight size={11} />}
              >
                {weightDifference > 0 ? `+${weightDifference}` : `${weightDifference}`} kg
              </MantineBadge>
            )}

            {selectedRecord ? (
              <MantineBadge size="xs" variant="outline" color="lime">
                {selectedRecord.weight.toFixed(1)} kg
              </MantineBadge>
            ) : latestRecord ? (
              <MantineBadge size="xs" variant="subtle" color="gray" title="Último peso registrado">
                Último: {latestRecord.weight.toFixed(1)} kg
              </MantineBadge>
            ) : null}
          </Group>
        </Group>
      </CardHeader>

      <CardContent style={{ paddingTop: 0 }}>
        <Stack gap={8}>
          {/* Linha de registro da data selecionada */}
          <Group align="center" gap="xs" wrap="nowrap">
            <NumberInput
              placeholder={latestRecord ? `Ex: ${latestRecord.weight}` : 'Ex: 75.5'}
              value={inputWeight}
              onChange={(val) => setInputWeight(typeof val === 'number' ? val : '')}
              decimalScale={1}
              step={0.1}
              min={25}
              max={350}
              suffix=" kg"
              size="xs"
              style={{ flex: 1 }}
              styles={{
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  borderColor: isViewingToday ? 'rgba(255, 255, 255, 0.1)' : 'rgba(56, 189, 248, 0.3)',
                  color: '#fff',
                  fontWeight: 600,
                  height: 32
                }
              }}
            />

            <Button
              variant={selectedRecord ? 'outline' : 'primary'}
              size="sm"
              onClick={handleSave}
              leftIcon={selectedRecord ? <TbCheck size={14} /> : <TbScale size={14} />}
              style={{ height: 32, flexShrink: 0 }}
            >
              {selectedRecord ? 'Atualizar' : 'Salvar'}
            </Button>
          </Group>

          {/* Resumo de IMC e Histórico Recente */}
          <Group justify="space-between" align="center" wrap="nowrap" pt={2}>
            {imcResult ? (
              <Group gap={6} align="center">
                <Text size="11px" c="dimmed">IMC:</Text>
                <Text size="12px" fw={700} c="white">{imcResult.imc.toFixed(1)}</Text>
                <MantineBadge
                  size="xs"
                  variant="dot"
                  style={{
                    backgroundColor: 'transparent',
                    color: imcResult.classification.color,
                    borderColor: 'rgba(255,255,255,0.08)'
                  }}
                >
                  {imcResult.classification.label}
                </MantineBadge>
              </Group>
            ) : (
              <Text size="11px" c="dimmed">Configure sua altura para ver o IMC</Text>
            )}

            {/* Pílulas dos últimos registros */}
            <Group gap={4} wrap="nowrap">
              {weightHistory.slice(-3).reverse().map((rec) => (
                <Box
                  key={rec.date}
                  px={6}
                  py={2}
                  style={{
                    borderRadius: 4,
                    background: rec.date === activeDate ? 'rgba(163, 230, 53, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: rec.date === activeDate ? '1px solid rgba(163, 230, 53, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '10px'
                  }}
                  title={formatDateDisplay(rec.date)}
                >
                  <Text size="10px" fw={600} c={rec.date === activeDate ? '#a3e635' : 'dimmed'}>
                    {rec.weight.toFixed(1)}k
                  </Text>
                </Box>
              ))}
            </Group>
          </Group>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default CompactWeightCard
