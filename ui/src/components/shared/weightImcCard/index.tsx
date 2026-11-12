import { useState, useMemo } from 'react'
import {
  Group,
  Text,
  NumberInput,
  Box
} from '@mantine/core'
import {
  TbScale,
  TbCalendarCheck,
  TbCalendarPlus,
  TbCheck
} from 'react-icons/tb'

import Card, { CardHeader, CardTitle, CardContent } from '@components/ui/card'
import ActionIcon from '@components/ui/actionIcon'
import SegmentedControl from '@components/ui/segmentedControl'
import Modal, { ModalBody, ModalFooter } from '@components/ui/modal'
import Button from '@components/ui/button'
import useToastStore from '@stores/toast'
import {
  calculateImc,
  getTodayDateString,
  formatDateDisplay,
  parseDecimalNumber,
  roundToOneDecimal
} from '@stores/health/utils'
import { WeightHistoryChart } from './weightHistoryChart'
import { ImcGaugeChart } from './imcGaugeChart'
import type { WeightImcCardProps } from './types'

export const WeightImcCard = ({
  heightCm,
  weightHistory,
  selectedDate,
  hoveredDate,
  onSaveWeight,
  onHoverDate
}: WeightImcCardProps) => {
  const { showToast } = useToastStore()
  const todayStr = getTodayDateString()
  const activeDate = selectedDate || todayStr

  const [selectedYear, selectedMonth] = useMemo(() => {
    const parts = activeDate.split('-').map(Number)
    const y = parts[0] || 2026
    const m = (parts[1] || 1) - 1
    return [y, m]
  }, [activeDate])

  const [chartType, setChartType] = useState<'line' | 'gauge'>('line')

  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false)
  const [targetCheckinDate, setTargetCheckinDate] = useState(activeDate)
  const [inputWeight, setInputWeight] = useState<number | string>('')

  const isTargetRecorded = useMemo(() => {
    return weightHistory.some((r) => r.date === activeDate)
  }, [weightHistory, activeDate])

  const isEditing = useMemo(() => {
    return weightHistory.some((r) => r.date === targetCheckinDate)
  }, [weightHistory, targetCheckinDate])

  const latestRecord = useMemo(() => {
    if (weightHistory.length === 0) return null
    return weightHistory[weightHistory.length - 1]
  }, [weightHistory])

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
    const initialVal = rec ? rec.weight : latestRecord ? latestRecord.weight : undefined
    setInputWeight(initialVal !== undefined ? roundToOneDecimal(initialVal).toFixed(1) : '')
    setIsCheckinModalOpen(true)
  }

  const handleCloseCheckin = () => {
    setIsCheckinModalOpen(false)
  }

  const handleConfirmCheckin = () => {
    const parsedWeight = parseDecimalNumber(inputWeight)
    const weightNum = roundToOneDecimal(parsedWeight)
    if (!weightNum || isNaN(weightNum) || weightNum < 20 || weightNum > 350) {
      showToast('Por favor, informe um peso válido entre 20 kg e 350 kg.', 'error')
      return
    }

    onSaveWeight(weightNum, targetCheckinDate)
    setIsCheckinModalOpen(false)

    if (isEditing) {
      showToast(
        targetCheckinDate === todayStr
          ? `Check-in de hoje atualizado: ${weightNum.toFixed(1)} kg!`
          : `Peso de ${formatDateDisplay(targetCheckinDate)} atualizado: ${weightNum.toFixed(1)} kg!`,
        'success'
      )
    } else {
      showToast(
        targetCheckinDate === todayStr
          ? `Check-in de hoje salvo: ${weightNum.toFixed(1)} kg!`
          : `Peso de ${formatDateDisplay(targetCheckinDate)} salvo: ${weightNum.toFixed(1)} kg!`,
        'success'
      )
    }
  }

  const previewImc = useMemo(() => {
    const w = roundToOneDecimal(parseDecimalNumber(inputWeight))
    if (!w || !heightCm) return null
    return calculateImc(w, heightCm)
  }, [inputWeight, heightCm])

  return (
    <>
      <Card style={{ position: 'relative', overflow: 'hidden' }}>
        <Box
          style={{
            position: 'absolute',
            top: -24,
            right: -24,
            width: 120,
            height: 120,
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        <CardHeader style={{ paddingBottom: 6, borderBottom: 'none' }}>
          <Group justify="space-between" align="center" wrap="wrap" gap="xs">
            <Group gap={6} align="center">
              <TbScale size={18} color="#38bdf8" />
              <CardTitle style={{ fontSize: '14px', fontWeight: 700 }}>Peso & IMC</CardTitle>
            </Group>

            <Group gap={8} align="center">
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
                size="sm"
                radius="md"
                variant="outline"
                onClick={() => handleOpenCheckin()}
                title={
                  isTargetRecorded
                    ? (activeDate === todayStr
                        ? `Editar Check-in de Peso (Hoje: ${activeWeight ? activeWeight.toFixed(1) + ' kg' : ''})`
                        : `Editar Check-in de Peso (${formatDateDisplay(activeDate)})`)
                    : (activeDate === todayStr
                        ? 'Fazer Check-in de Peso (Hoje)'
                        : `Fazer Check-in de Peso (${formatDateDisplay(activeDate)})`)
                }
                style={{
                  backgroundColor: isTargetRecorded ? 'rgba(56, 189, 248, 0.18)' : 'rgba(56, 189, 248, 0.1)',
                  borderColor: isTargetRecorded ? 'rgba(56, 189, 248, 0.45)' : 'rgba(56, 189, 248, 0.25)',
                  color: '#38bdf8'
                }}
              >
                {isTargetRecorded ? <TbCalendarCheck size={15} /> : <TbCalendarPlus size={15} />}
              </ActionIcon>
            </Group>
          </Group>
        </CardHeader>

        <CardContent style={{ paddingTop: 0 }}>
          {chartType === 'line' ? (
            <WeightHistoryChart
              records={weightHistory}
              height={heightCm}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              targetDate={selectedDate}
              hoveredDate={hoveredDate}
              onOpenCheckinModal={handleOpenCheckin}
              onHoverDate={onHoverDate}
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

      <Modal
        opened={isCheckinModalOpen}
        onClose={handleCloseCheckin}
        title={
          isEditing
            ? (targetCheckinDate === todayStr ? 'Editar Check-in de Peso - Hoje' : `Editar Peso - ${formatDateDisplay(targetCheckinDate)}`)
            : (targetCheckinDate === todayStr ? 'Check-in de Peso - Hoje' : `Novo Check-in de Peso - ${formatDateDisplay(targetCheckinDate)}`)
        }
        description={
          isEditing
            ? 'Altere o seu peso registrado para atualizar a trajetória e índice de massa corporal.'
            : 'Informe seu peso para atualizar a trajetória e índice de massa corporal.'
        }
        variant="indigo"
        size="sm"
      >
        <ModalBody>
          <Box pt="xs">
            <NumberInput
              autoFocus
              label="Peso corporal"
              placeholder="Ex: 70.0"
              value={inputWeight}
              onChange={(val) => setInputWeight(val)}
              decimalScale={1}
              fixedDecimalScale
              allowedDecimalSeparators={['.', ',']}
              step={0.1}
              min={20}
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
            {isEditing ? 'Atualizar Check-in' : 'Salvar Check-in'}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}

export default WeightImcCard
