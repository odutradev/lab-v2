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
  TbChevronLeft,
  TbChevronRight,
  TbCheck
} from 'react-icons/tb'

import Card, { CardHeader, CardTitle, CardContent } from '@components/ui/card'
import ActionIcon from '@components/ui/actionIcon'
import Modal, { ModalBody, ModalFooter } from '@components/ui/modal'
import Button from '@components/ui/button'
import useToastStore from '@stores/toast'
import { calculateImc, getTodayDateString, formatDateDisplay } from '@stores/health/utils'
import { WeightHistoryChart } from './weightHistoryChart'
import type { WeightImcCardProps } from './types'

export const WeightImcCard = ({
  heightCm,
  weightHistory,
  selectedDate,
  onSaveWeight
}: WeightImcCardProps) => {
  const { showToast } = useToastStore()
  const todayStr = getTodayDateString()

  // Controle de navegação do mês
  const [currentDate, setCurrentDate] = useState(() => {
    if (selectedDate) {
      const parts = selectedDate.split('-').map(Number)
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return new Date(parts[0], parts[1] - 1, parts[2] || 1)
      }
    }
    return new Date()
  })
  const [prevSelectedDate, setPrevSelectedDate] = useState(selectedDate)

  if (selectedDate !== prevSelectedDate) {
    setPrevSelectedDate(selectedDate)
    if (selectedDate) {
      const parts = selectedDate.split('-').map(Number)
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        setCurrentDate(new Date(parts[0], parts[1] - 1, parts[2] || 1))
      }
    }
  }

  const selectedYear = currentDate.getFullYear()
  const selectedMonth = currentDate.getMonth()

  // Modal de Check-in do dia
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false)
  const [targetCheckinDate, setTargetCheckinDate] = useState(selectedDate || todayStr)
  const [inputWeight, setInputWeight] = useState<number | string>('')

  const latestRecord = useMemo(() => {
    if (weightHistory.length === 0) return null
    return weightHistory[weightHistory.length - 1]
  }, [weightHistory])

  // Formatação do nome do mês atual
  const monthName = useMemo(() => {
    const raw = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    return raw.charAt(0).toUpperCase() + raw.slice(1)
  }, [currentDate])

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

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
            {/* Título e Navegação de Mês */}
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

              {/* Seletor Minimalista do Mês */}
              <Group gap={4} align="center" ml={4}>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="gray"
                  onClick={handlePrevMonth}
                  title="Mês anterior"
                >
                  <TbChevronLeft size={14} />
                </ActionIcon>

                <Text size="xs" fw={600} c="dimmed" style={{ minWidth: 105, textAlign: 'center' }}>
                  {monthName}
                </Text>

                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="gray"
                  onClick={handleNextMonth}
                  title="Próximo mês"
                >
                  <TbChevronRight size={14} />
                </ActionIcon>
              </Group>
            </Group>

            {/* Ícone de Ação de Check-in */}
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
        </CardHeader>

        {/* Conteúdo Exclusivo: Gráfico de Linha do Mês com Peso e IMC */}
        <CardContent>
          <WeightHistoryChart
            records={weightHistory}
            height={heightCm}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            targetDate={selectedDate}
            onOpenCheckinModal={handleOpenCheckin}
          />
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
