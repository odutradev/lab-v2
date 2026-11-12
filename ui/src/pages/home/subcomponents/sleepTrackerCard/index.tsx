import { useState, useMemo } from 'react'
import { Stack, Group, Text, Box, Badge as MantineBadge, Slider, UnstyledButton, alpha } from '@mantine/core'
import {
  TbMoonStars,
  TbCalendarCheck,
  TbCalendarPlus,
  TbCheck,
  TbClock,
  TbSparkles
} from 'react-icons/tb'

import Card, { CardHeader, CardTitle, CardContent } from '@components/card'
import ActionIcon from '@components/actionIcon'
import Modal, { ModalBody, ModalFooter } from '@components/modal'
import Button from '@components/button'
import useToastStore from '@stores/toast'
import {
  getTodayDateString,
  formatDateDisplay,
  SLEEP_QUALITY_OPTIONS,
  getSleepQualityOption,
  getSleepStatus
} from '@utils/functions/health'
import { SleepHistoryChart } from './subcomponents/sleepHistoryChart'
import type { SleepTrackerCardProps } from './types'
import { colors } from '@styles/theme'

export const SleepTrackerCard = ({
  sleepHistory,
  selectedDate,
  hoveredDate,
  onSaveSleep,
  onHoverDate
}: SleepTrackerCardProps) => {
  const { showToast } = useToastStore()
  const todayStr = getTodayDateString()
  const activeDate = selectedDate || todayStr

  const [selectedYear, selectedMonth] = useMemo(() => {
    const parts = activeDate.split('-').map(Number)
    const y = parts[0] || 2026
    const m = (parts[1] || 1) - 1
    return [y, m]
  }, [activeDate])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [targetDate, setTargetDate] = useState(activeDate)
  const [inputHours, setInputHours] = useState<number>(8)
  const [inputQuality, setInputQuality] = useState<number>(4)

  const isTargetRecorded = useMemo(() => {
    return sleepHistory.some((r) => r.date === activeDate)
  }, [sleepHistory, activeDate])

  const isEditing = useMemo(() => {
    return sleepHistory.some((r) => r.date === targetDate)
  }, [sleepHistory, targetDate])

  const activeRecord = useMemo(() => {
    if (selectedDate) {
      const found = sleepHistory.find((r) => r.date === selectedDate)
      if (found) return found
    }
    return sleepHistory.find((r) => r.date === todayStr) || null
  }, [sleepHistory, selectedDate, todayStr])

  const handleOpenCheckin = (dateToUse?: string) => {
    const target = dateToUse || selectedDate || todayStr
    setTargetDate(target)

    const existing = sleepHistory.find((r) => r.date === target)
    if (existing) {
      setInputHours(existing.hours)
      setInputQuality(existing.quality)
    } else {
      setInputHours(8)
      setInputQuality(4)
    }

    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleConfirmSave = () => {
    onSaveSleep(inputHours, inputQuality, targetDate)
    setIsModalOpen(false)

    const qualityOpt = getSleepQualityOption(inputQuality)
    const isToday = targetDate === todayStr

    if (isEditing) {
      showToast(
        isToday
          ? `Check-in de sono atualizado: ${inputHours.toFixed(1)}h • ${qualityOpt.emoji} ${qualityOpt.label}!`
          : `Sono de ${formatDateDisplay(targetDate)} atualizado: ${inputHours.toFixed(1)}h • ${qualityOpt.emoji} ${qualityOpt.label}!`,
        'success'
      )
    } else {
      showToast(
        isToday
          ? `Check-in de sono salvo: ${inputHours.toFixed(1)}h • ${qualityOpt.emoji} ${qualityOpt.label}!`
          : `Sono de ${formatDateDisplay(targetDate)} salvo: ${inputHours.toFixed(1)}h • ${qualityOpt.emoji} ${qualityOpt.label}!`,
        'success'
      )
    }
  }

  const modalStatus = useMemo(() => getSleepStatus(inputHours), [inputHours])

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
            background: `radial-gradient(circle, ${alpha(colors.purple500, 0.15)} 0%, transparent 70%)`,
            pointerEvents: 'none'
          }}
        />

        <CardHeader style={{ paddingBottom: 6, borderBottom: 'none' }}>
          <Group justify="space-between" align="center" wrap="wrap" gap="xs">
            <Group gap={6} align="center">
              <TbMoonStars size={18} color={colors.purple400} />
              <CardTitle style={{ fontSize: '14px', fontWeight: 700 }}>
                Sono & Recuperação
              </CardTitle>
            </Group>

            <Group gap={8} align="center">
              {activeRecord && (
                <MantineBadge
                  variant="light"
                  size="sm"
                  color="violet"
                  leftSection={<TbSparkles size={11} />}
                  onClick={() => handleOpenCheckin(activeDate)}
                  style={{ cursor: 'pointer' }}
                  title="Clique para editar este check-in de sono"
                >
                  {activeRecord.hours.toFixed(1)}h • {getSleepQualityOption(activeRecord.quality).emoji}
                </MantineBadge>
              )}

              <ActionIcon
                size="sm"
                radius="md"
                variant="outline"
                onClick={() => handleOpenCheckin()}
                title={
                  isTargetRecorded
                    ? (activeDate === todayStr
                        ? `Editar Check-in de Sono (Hoje: ${activeRecord ? activeRecord.hours.toFixed(1) + 'h' : ''})`
                        : `Editar Check-in de Sono (${formatDateDisplay(activeDate)})`)
                    : (activeDate === todayStr
                        ? 'Fazer Check-in de Sono (Hoje)'
                        : `Fazer Check-in de Sono (${formatDateDisplay(activeDate)})`)
                }
                style={{
                  backgroundColor: isTargetRecorded ? alpha(colors.purple500, 0.18) : alpha(colors.purple500, 0.1),
                  borderColor: isTargetRecorded ? alpha(colors.purple500, 0.45) : alpha(colors.purple500, 0.25),
                  color: colors.purple400
                }}
              >
                {isTargetRecorded ? <TbCalendarCheck size={15} /> : <TbCalendarPlus size={15} />}
              </ActionIcon>
            </Group>
          </Group>
        </CardHeader>

        <CardContent style={{ paddingTop: 0 }}>
          <SleepHistoryChart
            records={sleepHistory}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            targetDate={selectedDate}
            hoveredDate={hoveredDate}
            onOpenCheckinModal={handleOpenCheckin}
            onHoverDate={onHoverDate}
          />
        </CardContent>
      </Card>

      <Modal
        opened={isModalOpen}
        onClose={handleCloseModal}
        title={
          isEditing
            ? (targetDate === todayStr
                ? 'Editar Check-in de Sono - Hoje'
                : `Editar Sono - ${formatDateDisplay(targetDate)}`)
            : (targetDate === todayStr
                ? 'Check-in de Sono - Hoje'
                : `Registrar Sono - ${formatDateDisplay(targetDate)}`)
        }
        description={
          isEditing
            ? 'Atualize a duração e a qualidade da sua noite de sono para recalcular sua recuperação.'
            : 'Informe a duração e avalie a qualidade da sua noite de sono para atualizar sua evolução.'
        }
        variant="indigo"
        size="sm"
      >
        <ModalBody>
          <Stack gap="lg" pt="xs">
            <Box>
              <Group justify="space-between" align="baseline" mb="xs">
                <Group gap={6} align="center">
                  <TbClock size={16} color={colors.purple400} />
                  <Text size="sm" fw={600} c={colors.white}>
                    Horas de Sono
                  </Text>
                </Group>

                <Group gap="xs" align="baseline">
                  <Text size="20px" fw={800} c={colors.purple400}>
                    {inputHours.toFixed(1)}h
                  </Text>
                  <MantineBadge
                    size="xs"
                    variant="light"
                    style={{
                      backgroundColor: `${modalStatus.color}22`,
                      color: modalStatus.color
                    }}
                  >
                    {modalStatus.label}
                  </MantineBadge>
                </Group>
              </Group>

              <Slider
                value={inputHours}
                onChange={setInputHours}
                min={1}
                max={14}
                step={0.5}
                marks={[
                  { value: 4, label: '4h' },
                  { value: 6, label: '6h' },
                  { value: 8, label: '8h' },
                  { value: 10, label: '10h' },
                  { value: 12, label: '12h' }
                ]}
                label={(val) => `${val.toFixed(1)}h`}
                color="violet"
                styles={{
                  track: {
                    backgroundColor: alpha(colors.white, 0.1)
                  },
                  bar: {
                    background: `linear-gradient(90deg, ${colors.violet600} 0%, ${colors.purple400} 100%)`
                  },
                  thumb: {
                    borderColor: colors.purple400
                  },
                  markLabel: {
                    color: alpha(colors.white, 0.45),
                    fontSize: '11px',
                    marginTop: 6
                  }
                }}
              />

              <Text size="xs" c="dimmed" mt="lg">
                Faixa recomendada: 7.0h a 9.0h para recuperação biológica ideal.
              </Text>
            </Box>

            <Box>
              <Text size="sm" fw={600} c={colors.white} mb="xs">
                Qualidade da Noite (1 a 5)
              </Text>

              <Group gap={6} grow wrap="nowrap">
                {SLEEP_QUALITY_OPTIONS.map((opt) => {
                  const isSelected = inputQuality === opt.value
                  return (
                    <UnstyledButton
                      key={opt.value}
                      onClick={() => setInputQuality(opt.value)}
                      title={`${opt.label} (${opt.value}/5)`}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        padding: '8px 2px',
                        borderRadius: 8,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        backgroundColor: isSelected
                          ? `${opt.color}25`
                          : alpha(colors.white, 0.04),
                        border: isSelected
                          ? `2px solid ${opt.color}`
                          : `1px solid ${alpha(colors.white, 0.1)}`,
                        transition: 'all 0.15s ease',
                        cursor: 'pointer'
                      }}
                    >
                      <Text size="24px" style={{ lineHeight: 1 }}>
                        {opt.emoji}
                      </Text>
                      <Text
                        size="11px"
                        fw={isSelected ? 700 : 500}
                        style={{
                          color: isSelected ? opt.color : alpha(colors.white, 0.7),
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%'
                        }}
                      >
                        {opt.label}
                      </Text>
                    </UnstyledButton>
                  )
                })}
              </Group>
            </Box>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirmSave}
            leftIcon={<TbCheck size={15} />}
          >
            {isEditing ? 'Atualizar Check-in' : 'Salvar Check-in'}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}

export default SleepTrackerCard
