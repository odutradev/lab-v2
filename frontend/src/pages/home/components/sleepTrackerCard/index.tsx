import { useState, useMemo } from 'react'
import {
  Stack,
  Group,
  Text,
  Box,
  Badge as MantineBadge,
  ThemeIcon,
  Slider,
  Progress,
  UnstyledButton
} from '@mantine/core'
import {
  TbMoonStars,
  TbCalendarCheck,
  TbCheck,
  TbClock,
  TbBed,
  TbSparkles
} from 'react-icons/tb'

import Card, { CardHeader, CardTitle, CardContent } from '@components/ui/card'
import ActionIcon from '@components/ui/actionIcon'
import Modal, { ModalBody, ModalFooter } from '@components/ui/modal'
import Button from '@components/ui/button'
import useToastStore from '@stores/toast'
import {
  getTodayDateString,
  formatDateDisplay,
  SLEEP_QUALITY_OPTIONS,
  getSleepQualityOption,
  getSleepStatus
} from '@stores/health/utils'
import type { SleepTrackerCardProps } from './types'

export const SleepTrackerCard = ({
  sleepHistory,
  selectedDate,
  onSaveSleep
}: SleepTrackerCardProps) => {
  const { showToast } = useToastStore()
  const todayStr = getTodayDateString()
  const activeDate = selectedDate || todayStr

  // Modal de Check-in
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [targetDate, setTargetDate] = useState(activeDate)
  const [inputHours, setInputHours] = useState<number>(8)
  const [inputQuality, setInputQuality] = useState<number>(4)

  // Registro ativo (da data selecionada ou de hoje)
  const activeRecord = useMemo(() => {
    return sleepHistory.find((r) => r.date === activeDate)
  }, [sleepHistory, activeDate])

  // Registro mais recente
  const latestRecord = useMemo(() => {
    if (sleepHistory.length === 0) return null
    return sleepHistory[sleepHistory.length - 1]
  }, [sleepHistory])

  // Dados para exibição no card de hoje
  const displayRecord = activeRecord || (activeDate === todayStr ? latestRecord : null)
  const currentQualityOpt = displayRecord ? getSleepQualityOption(displayRecord.quality) : null
  const currentStatus = displayRecord ? getSleepStatus(displayRecord.hours) : null

  // Histórico dos últimos 7 dias
  const last7Days = useMemo(() => {
    const days: {
      date: string
      dayName: string
      dayNumber: number
      isToday: boolean
      record?: (typeof sleepHistory)[0]
    }[] = []

    const [yyyyStr, mmStr, ddStr] = todayStr.split('-').map(Number)
    const baseDate = new Date(yyyyStr, (mmStr || 1) - 1, ddStr || 1)

    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate)
      d.setDate(baseDate.getDate() - i)
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const dateStr = `${yyyy}-${mm}-${dd}`
      const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase()
      const dayNumber = d.getDate()
      const record = sleepHistory.find((r) => r.date === dateStr)

      days.push({
        date: dateStr,
        dayName,
        dayNumber,
        isToday: dateStr === todayStr,
        record
      })
    }
    return days
  }, [sleepHistory, todayStr])

  const handleOpenCheckin = (dateToUse?: string, initialQuality?: number) => {
    const target = dateToUse || activeDate
    setTargetDate(target)

    const existing = sleepHistory.find((r) => r.date === target)
    if (existing) {
      setInputHours(existing.hours)
      setInputQuality(initialQuality || existing.quality)
    } else {
      setInputHours(8)
      setInputQuality(initialQuality || 4)
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
    showToast(
      isToday
        ? `Sono registrado: ${inputHours.toFixed(1)}h • ${qualityOpt.emoji} ${qualityOpt.label}!`
        : `Sono de ${formatDateDisplay(targetDate)} registrado: ${inputHours.toFixed(1)}h • ${qualityOpt.emoji} ${qualityOpt.label}!`,
      'success'
    )
  }

  // Preview de status no modal conforme o slider se move
  const modalStatus = useMemo(() => getSleepStatus(inputHours), [inputHours])

  return (
    <>
      <Card style={{ position: 'relative', overflow: 'hidden' }}>
        <CardHeader>
          <Group justify="space-between" align="center" wrap="nowrap">
            {/* Título e Ícone */}
            <Group gap="sm" align="center">
              <ThemeIcon
                size="md"
                radius="md"
                variant="light"
                color="violet"
                style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)' }}
              >
                <TbMoonStars size={18} color="#c084fc" />
              </ThemeIcon>

              <CardTitle style={{ fontSize: '15px', fontWeight: 700 }}>
                Sono & Recuperação
              </CardTitle>

              <MantineBadge size="xs" variant="outline" color="violet">
                {formatDateDisplay(activeDate)}
              </MantineBadge>
            </Group>

            {/* Ações do Header */}
            <Group gap="xs" align="center">
              {displayRecord && (
                <MantineBadge
                  variant="light"
                  size="xs"
                  color="violet"
                  leftSection={<TbSparkles size={11} />}
                >
                  {displayRecord.hours.toFixed(1)}h dormidas
                </MantineBadge>
              )}

              <ActionIcon
                size="lg"
                radius="md"
                variant="outline"
                onClick={() => handleOpenCheckin()}
                title="Fazer Check-in de Sono"
                style={{
                  backgroundColor: 'rgba(168, 85, 247, 0.12)',
                  borderColor: 'rgba(168, 85, 247, 0.35)',
                  color: '#c084fc'
                }}
              >
                <TbCalendarCheck size={18} />
              </ActionIcon>
            </Group>
          </Group>
        </CardHeader>

        <CardContent>
          <Stack gap="md">
            {/* Bloco de Resumo do Dia / Noite */}
            <Box
              style={{
                borderRadius: 10,
                background: 'rgba(168, 85, 247, 0.04)',
                border: '1px solid rgba(168, 85, 247, 0.18)',
                padding: '12px 14px'
              }}
            >
              {displayRecord && currentQualityOpt && currentStatus ? (
                <>
                  <Group justify="space-between" align="baseline" mb={8}>
                    <Group align="baseline" gap={6}>
                      <Text size="22px" fw={800} c="#c084fc" style={{ lineHeight: 1 }}>
                        {displayRecord.hours.toFixed(1)}h
                      </Text>
                      <Text size="xs" c="dimmed">
                        / 8.0h meta
                      </Text>
                    </Group>

                    <Group gap="xs" align="center">
                      <MantineBadge
                        size="xs"
                        variant="filled"
                        style={{
                          backgroundColor: `${currentQualityOpt.color}25`,
                          color: currentQualityOpt.color,
                          border: `1px solid ${currentQualityOpt.color}55`
                        }}
                      >
                        {currentQualityOpt.emoji} {currentQualityOpt.label}
                      </MantineBadge>

                      <Text size="xs" fw={600} style={{ color: currentStatus.color }}>
                        {currentStatus.label}
                      </Text>
                    </Group>
                  </Group>

                  <Progress
                    value={Math.min(100, Math.round((displayRecord.hours / 8) * 100))}
                    size="xs"
                    radius="xl"
                    color="violet"
                    styles={{
                      root: {
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        height: 5
                      },
                      section: {
                        background: 'linear-gradient(90deg, #7c3aed 0%, #c084fc 100%)'
                      }
                    }}
                  />

                  <Text size="11px" c="dimmed" mt={6}>
                    {currentStatus.description}
                  </Text>
                </>
              ) : (
                <Group justify="space-between" align="center">
                  <Box>
                    <Text size="sm" fw={600} c="#fff">
                      Nenhum check-in de sono hoje
                    </Text>
                    <Text size="xs" c="dimmed">
                      Registre as horas dormidas e a qualidade da noite.
                    </Text>
                  </Box>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenCheckin()}
                    leftIcon={<TbBed size={14} />}
                  >
                    Registrar Sono
                  </Button>
                </Group>
              )}
            </Box>

            {/* Avaliação de Qualidade com Emojis (Muito Ruim a Muito Bom) */}
            <Box>
              <Group justify="space-between" align="center" mb={8}>
                <Text
                  size="xs"
                  fw={600}
                  c="dimmed"
                  style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                >
                  Qualidade do Sono
                </Text>
                <Text size="11px" c="dimmed">
                  Toque para registrar ou ajustar
                </Text>
              </Group>

              <Group gap={6} grow wrap="nowrap">
                {SLEEP_QUALITY_OPTIONS.map((opt) => {
                  const isSelected = displayRecord?.quality === opt.value
                  return (
                    <UnstyledButton
                      key={opt.value}
                      onClick={() => handleOpenCheckin(activeDate, opt.value)}
                      title={`${opt.label} (${opt.value}/5)`}
                      style={{
                        padding: '8px 4px',
                        borderRadius: 8,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        backgroundColor: isSelected
                          ? `${opt.color}22`
                          : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected
                          ? `1px solid ${opt.color}`
                          : '1px solid rgba(255, 255, 255, 0.07)',
                        transition: 'all 0.15s ease',
                        cursor: 'pointer'
                      }}
                    >
                      <Text size="20px" style={{ lineHeight: 1 }}>
                        {opt.emoji}
                      </Text>
                      <Text
                        size="10px"
                        fw={isSelected ? 700 : 500}
                        style={{
                          color: isSelected ? opt.color : 'rgba(255, 255, 255, 0.65)',
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

            {/* Histórico Semanal dos Últimos 7 Dias */}
            <Box>
              <Group justify="space-between" align="center" mb={8}>
                <Text
                  size="xs"
                  fw={600}
                  c="dimmed"
                  style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                >
                  Últimos 7 Dias
                </Text>
                <Text size="11px" c="dimmed">
                  Clique no dia para editar
                </Text>
              </Group>

              <Group gap={6} grow wrap="nowrap">
                {last7Days.map((day) => {
                  const opt = day.record ? getSleepQualityOption(day.record.quality) : null
                  return (
                    <UnstyledButton
                      key={day.date}
                      onClick={() => handleOpenCheckin(day.date)}
                      title={
                        day.record
                          ? `${formatDateDisplay(day.date)}: ${day.record.hours}h (${opt?.label})`
                          : `${formatDateDisplay(day.date)}: Sem registro`
                      }
                      style={{
                        padding: '8px 4px',
                        borderRadius: 8,
                        textAlign: 'center',
                        backgroundColor: day.isToday
                          ? 'rgba(168, 85, 247, 0.12)'
                          : 'rgba(255, 255, 255, 0.02)',
                        border: day.isToday
                          ? '1px solid rgba(168, 85, 247, 0.4)'
                          : '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'all 0.15s ease',
                        cursor: 'pointer'
                      }}
                    >
                      <Text size="9px" fw={700} c={day.isToday ? '#c084fc' : 'dimmed'}>
                        {day.dayName}
                      </Text>
                      <Text size="11px" fw={600} c="#fff" my={2}>
                        {day.dayNumber}
                      </Text>

                      {day.record ? (
                        <>
                          <Text size="14px" style={{ lineHeight: 1 }}>
                            {opt?.emoji}
                          </Text>
                          <Text size="9px" fw={700} c="#c084fc" mt={2}>
                            {day.record.hours}h
                          </Text>
                        </>
                      ) : (
                        <Text size="11px" c="dimmed" my={2}>
                          -
                        </Text>
                      )}
                    </UnstyledButton>
                  )
                })}
              </Group>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Modal de Check-in de Sono */}
      <Modal
        opened={isModalOpen}
        onClose={handleCloseModal}
        title={
          targetDate === todayStr
            ? 'Check-in de Sono - Hoje'
            : `Atualizar Sono - ${formatDateDisplay(targetDate)}`
        }
        description="Monitore a duração e a qualidade do seu sono para manter o corpo em alta recuperação."
        variant="indigo"
        size="sm"
      >
        <ModalBody>
          <Stack gap="lg" pt="xs">
            {/* Slider com Horas de Sono */}
            <Box>
              <Group justify="space-between" align="baseline" mb="xs">
                <Group gap={6} align="center">
                  <TbClock size={16} color="#c084fc" />
                  <Text size="sm" fw={600} c="#fff">
                    Horas de Sono
                  </Text>
                </Group>

                <Group gap="xs" align="baseline">
                  <Text size="20px" fw={800} c="#c084fc">
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
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  },
                  bar: {
                    background: 'linear-gradient(90deg, #7c3aed 0%, #c084fc 100%)'
                  },
                  thumb: {
                    borderColor: '#c084fc'
                  },
                  markLabel: {
                    color: 'rgba(255, 255, 255, 0.45)',
                    fontSize: '11px',
                    marginTop: 6
                  }
                }}
              />

              <Text size="xs" c="dimmed" mt="lg">
                Faixa recomendada: 7.0h a 9.0h para recuperação ideal.
              </Text>
            </Box>

            {/* Avaliação de Qualidade de 1 a 5 com Emojis */}
            <Box>
              <Text size="sm" fw={600} c="#fff" mb="xs">
                Qualidade da Noite (1 a 5)
              </Text>

              <Group gap={6} grow wrap="nowrap">
                {SLEEP_QUALITY_OPTIONS.map((opt) => {
                  const isSelected = inputQuality === opt.value
                  return (
                    <UnstyledButton
                      key={opt.value}
                      onClick={() => setInputQuality(opt.value)}
                      style={{
                        padding: '10px 4px',
                        borderRadius: 8,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        backgroundColor: isSelected
                          ? `${opt.color}25`
                          : 'rgba(255, 255, 255, 0.04)',
                        border: isSelected
                          ? `2px solid ${opt.color}`
                          : '1px solid rgba(255, 255, 255, 0.1)',
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
                          color: isSelected ? opt.color : 'rgba(255, 255, 255, 0.7)',
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
            Salvar Check-in
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}

export default SleepTrackerCard
