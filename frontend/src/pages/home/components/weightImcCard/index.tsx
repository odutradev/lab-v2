import { useState, useMemo } from 'react'
import {
  Stack,
  Group,
  Text,
  NumberInput,
  Divider,
  Box,
  Badge as MantineBadge
} from '@mantine/core'
import { TbScale, TbCheck, TbHistory, TbArrowUpRight, TbArrowDownRight } from 'react-icons/tb'

import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@components/ui/card'
import Button from '@components/ui/button'
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

  const [inputWeight, setInputWeight] = useState<number | string>(
    todayRecord ? todayRecord.weight : latestRecord ? latestRecord.weight : ''
  )

  const imcResult = useMemo(() => {
    const currentWeight = todayRecord?.weight || latestRecord?.weight
    return calculateImc(currentWeight, heightCm)
  }, [todayRecord, latestRecord, heightCm])

  const handleSave = () => {
    const weightNum = Number(inputWeight)
    if (!weightNum || isNaN(weightNum) || weightNum < 25 || weightNum > 350) {
      showToast('Por favor, informe um peso válido entre 25 kg e 350 kg.', 'error')
      return
    }

    onSaveWeight(weightNum, todayStr)
    showToast(
      todayRecord
        ? `Peso de hoje atualizado para ${weightNum.toFixed(1)} kg!`
        : `Peso de hoje salvo com sucesso (${weightNum.toFixed(1)} kg)!`,
      'success'
    )
  }

  // Variação em relação ao registro anterior
  const weightDifference = useMemo(() => {
    if (weightHistory.length < 2) return null
    const latest = weightHistory[weightHistory.length - 1].weight
    const previous = weightHistory[weightHistory.length - 2].weight
    const diff = Math.round((latest - previous) * 10) / 10
    return diff
  }, [weightHistory])

  return (
    <Card>
      <CardHeader>
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Box>
            <CardTitle>Controle de Peso & IMC</CardTitle>
            <CardDescription>
              Registre 1 vez ao dia para acompanhar seu histórico e status corporal
            </CardDescription>
          </Box>

          {latestRecord && (
            <Group gap="xs">
              {weightDifference !== null && (
                <MantineBadge
                  size="sm"
                  variant="light"
                  color={weightDifference > 0 ? 'orange' : weightDifference < 0 ? 'teal' : 'gray'}
                  leftSection={
                    weightDifference > 0 ? (
                      <TbArrowUpRight size={14} />
                    ) : (
                      <TbArrowDownRight size={14} />
                    )
                  }
                >
                  {weightDifference > 0 ? `+${weightDifference}` : `${weightDifference}`} kg
                </MantineBadge>
              )}
              <MantineBadge size="sm" variant="outline" color="indigo">
                {latestRecord.weight.toFixed(1)} kg atual
              </MantineBadge>
            </Group>
          )}
        </Group>
      </CardHeader>

      <CardContent>
        <Stack gap="lg">
          {/* Formulário de Registro Diário */}
          <Box
            p="md"
            style={{
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <Group justify="space-between" align="center" mb="xs" wrap="wrap">
              <Group gap="xs">
                <TbScale size={18} color="#818cf8" />
                <Text size="sm" fw={600} c="white">
                  Registro de Hoje ({formatDateDisplay(todayStr)})
                </Text>
              </Group>

              {todayRecord ? (
                <MantineBadge color="teal" variant="light" size="sm" leftSection={<TbCheck size={12} />}>
                  Registrado hoje: {todayRecord.weight.toFixed(1)} kg
                </MantineBadge>
              ) : (
                <MantineBadge color="yellow" variant="light" size="sm">
                  Pendente hoje
                </MantineBadge>
              )}
            </Group>

            <Group align="flex-end" gap="sm">
              <Box style={{ flex: 1 }}>
                <NumberInput
                  placeholder="Seu peso em kg (ex: 75.5)"
                  value={inputWeight}
                  onChange={(val) => setInputWeight(typeof val === 'number' ? val : '')}
                  decimalScale={1}
                  step={0.1}
                  min={25}
                  max={350}
                  suffix=" kg"
                  styles={{
                    input: {
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      fontSize: 16,
                      fontWeight: 600
                    }
                  }}
                />
              </Box>

              <Button
                variant={todayRecord ? 'outline' : 'primary'}
                onClick={handleSave}
                leftIcon={<TbScale size={16} />}
              >
                {todayRecord ? 'Atualizar Peso' : 'Salvar Peso de Hoje'}
              </Button>
            </Group>
          </Box>

          {/* Gráfico / Medidor de IMC (Classificação Real OMS) */}
          <ImcGaugeChart
            imcResult={imcResult}
            heightCm={heightCm}
            currentWeight={todayRecord?.weight || latestRecord?.weight}
            onConfigureHeight={onOpenPhysicalModal}
          />

          <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }} />

          {/* Gráfico Minimalista de Histórico de Peso */}
          <WeightHistoryChart records={weightHistory} height={heightCm} />

          {/* Linha de registros recentes */}
          {weightHistory.length > 0 && (
            <Box>
              <Group gap="xs" mb="xs">
                <TbHistory size={16} color="rgba(255, 255, 255, 0.5)" />
                <Text size="xs" fw={600} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Histórico Registrado
                </Text>
              </Group>

              <Group gap="xs" wrap="wrap">
                {weightHistory
                  .slice(-7)
                  .reverse()
                  .map((item) => (
                    <Box
                      key={item.date}
                      px="sm"
                      py={6}
                      style={{
                        borderRadius: 8,
                        background:
                          item.date === todayStr
                            ? 'rgba(99, 102, 241, 0.15)'
                            : 'rgba(255, 255, 255, 0.03)',
                        border:
                          item.date === todayStr
                            ? '1px solid rgba(129, 140, 248, 0.4)'
                            : '1px solid rgba(255, 255, 255, 0.06)'
                      }}
                    >
                      <Text size="11px" c="dimmed">
                        {formatDateDisplay(item.date)}
                      </Text>
                      <Text size="xs" fw={700} c="white">
                        {item.weight.toFixed(1)} kg
                      </Text>
                    </Box>
                  ))}
              </Group>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}

export default WeightImcCard
