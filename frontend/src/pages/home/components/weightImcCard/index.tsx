import { useState, useMemo } from 'react'
import {
  Group,
  Text,
  NumberInput,
  Box,
  ThemeIcon
} from '@mantine/core'
import {
  TbScale,
  TbCalendarCheck,
  TbCheck
} from 'react-icons/tb'

import Card, { CardHeader, CardTitle, CardContent } from '@components/ui/card'
import ActionIcon from '@components/ui/actionIcon'
import SegmentedControl from '@components/ui/segmentedControl'
import Modal, { ModalBody, ModalFooter } from '@components/ui/modal'
import Button from '@components/ui/button'
import useToastStore from '@stores/toast'
import { calculateImc, getTodayDateString, formatDateDisplay } from '@stores/health/utils'
import { WeightHistoryChart } from './weightHistoryChart'
import { ImcGaugeChart } from './imcGaugeChart'
import type { WeightImcCardProps } from './types'

export const WeightImcCard = ({
  heightCm,
  weightHistory,
  selectedDate,
  onSaveWeight
}: WeightImcCardProps) => {
  const { showToast } = useToastStore()
  const todayStr = getTodayDateString()
  const activeDate = selectedDate || todayStr

  // O mês e ano do gráfico acompanham estritamente o mês do calendário
  const [selectedYear, selectedMonth] = useMemo(() => {
    const parts = activeDate.split('-').map(Number)
    const y = parts[0] || 2026
    const m = (parts[1] || 1) - 1
    return [y, m]
  }, [activeDate])

  // Tipo de visualização: Linha mensal de evolução ou Medidor de Classificação de IMC
  const [chartType, setChartType] = useState<'line' | 'gauge'>('line')

  // Modal de Check-in do dia
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false)
  const [targetCheckinDate, setTargetCheckinDate] = useState(activeDate)
  const [inputWeight, setInputWeight] = useState<number | string>('')

  const latestRecord = useMemo(() => {
    if (weightHistory.length === 0) return null
    return weightHistory[weightHistory.length - 1]
  }, [weightHistory])

  // Registro ativo para o medidor de IMC
  const activeRecord = useMemo(() => {
    if (selectedDate) {
      const found = weightHistory.find((r) => r.date === selectedDate)
      if (found) return found
    }
    return latestRecord
  }, [weightHistory, selectedDate, latestRecord])

  const activeWeight = activeRecord ? activeRecord.weight : undefined

  const activeImcResult = useMemo(() => {
    if (!activeWeight || !heightCm) return null
    return calculateImc(activeWeight, heightCm)
  }, [activeWeight, heightCm])

  const handleOpenCheckin = (date?: string) => {
    const dateToUse = date || selectedDate || todayStr
    setTargetCheckinDate(dateToUse)

    const rec = weightHistory.find((r) => r.date === dateToUse)
    setInputWeight(rec ? rec.weight : latestRecord ? latestRecord.weight : '')
    setIsCheckinModalOpen(true)
  }

  const handleCloseCheckin = () => {
    setIsCheckinModalOpen(false)
  }

  const handleConfirmCheckin = () => {
    const weightNum = Number(inputWeight)
    if (!weightNum || isNaN(weightNum) || weightNum < 25 || weightNum > 350) {
      showToast('Por favor, informe um peso válido entre 25 kg e 350 kg.', 'error')
      return
    }

    onSaveWeight(weightNum, targetCheckinDate)
    setIsCheckinModalOpen(false)
    showToast(
      targetCheckinDate === todayStr
        ? `Check-in de hoje salvo: ${weightNum.toFixed(1)} kg!`
        : `Peso de ${formatDateDisplay(targetCheckinDate)} salvo: ${weightNum.toFixed(1)} kg!`,
      'success'
    )
  }

  // Preview de IMC em tempo real dentro do modal
  const previewImc = useMemo(() => {
    const w = Number(inputWeight)
    if (!w || !heightCm) return null
    return calculateImc(w, heightCm)
  }, [inputWeight, heightCm])

  return (
    <>
      <Card style={{ position: 'relative', overflow: 'hidden' }}>
        <CardHeader>
          <Group justify="space-between" align="center" wrap="nowrap">
            {/* Título */}
            <Group gap="sm" align="center">
              <ThemeIcon
                size="md"
                radius="md"
                variant="light"
                color="cyan"
                style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)' }}
              >
                <TbScale size={18} color="#38bdf8" />
              </ThemeIcon>

              <CardTitle style={{ fontSize: '15px', fontWeight: 700 }}>Peso & IMC</CardTitle>
            </Group>

            {/* Alternador de Gráficos e Check-in */}
            <Group gap="xs" align="center">
              <SegmentedControl
                size="xs"
                value={chartType}
                onChange={(val) => setChartType(val as 'line' | 'gauge')}
                data={[
                  { label: 'Evolução', value: 'line' },
                  { label: 'Classificação', value: 'gauge' }
                ]}
              />

              <ActionIcon
                size="lg"
                radius="md"
                variant="outline"
                onClick={() => handleOpenCheckin()}
                title="Fazer Check-in de Peso"
                style={{
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  borderColor: 'rgba(56, 189, 248, 0.35)',
                  color: '#38bdf8'
                }}
              >
                <TbCalendarCheck size={18} />
              </ActionIcon>
            </Group>
          </Group>
        </CardHeader>

        {/* Conteúdo Dinâmico: Gráfico de Linha ou Medidor de IMC */}
        <CardContent>
          {chartType === 'line' ? (
            <WeightHistoryChart
              records={weightHistory}
              height={heightCm}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              targetDate={selectedDate}
              onOpenCheckinModal={handleOpenCheckin}
            />
          ) : (
            <ImcGaugeChart
              imcResult={activeImcResult}
              heightCm={heightCm}
              currentWeight={activeWeight}
            />
          )}
        </CardContent>
      </Card>

      {/* Modal Minimalista de Check-in */}
      <Modal
        opened={isCheckinModalOpen}
        onClose={handleCloseCheckin}
        title={targetCheckinDate === todayStr ? 'Check-in de Peso - Hoje' : `Atualizar Peso - ${formatDateDisplay(targetCheckinDate)}`}
        description="Informe seu peso para atualizar a trajetória e índice de massa corporal."
        variant="indigo"
        size="sm"
      >
        <ModalBody>
          <Box pt="xs">
            <NumberInput
              autoFocus
              label="Peso corporal"
              placeholder="Ex: 69.0"
              value={inputWeight}
              onChange={(val) => setInputWeight(typeof val === 'number' ? val : '')}
              decimalScale={1}
              step={0.1}
              min={25}
              max={350}
              suffix=" kg"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmCheckin()
                if (e.key === 'Escape') handleCloseCheckin()
              }}
              styles={{
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '16px',
                  height: 42
                }
              }}
            />

            {previewImc && (
              <Group justify="space-between" align="center" mt="sm" p="xs" style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: 8 }}>
                <Text size="xs" c="dimmed">
                  IMC correspondente:
                </Text>
                <Text size="xs" fw={700} c="#c084fc">
                  {previewImc.imc.toFixed(1)} kg/m² • {previewImc.classification.label}
                </Text>
              </Group>
            )}
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={handleCloseCheckin}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirmCheckin}
            leftIcon={<TbCheck size={15} />}
          >
            Salvar Check-in
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}

export default WeightImcCard
