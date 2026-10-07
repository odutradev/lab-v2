import { useState, useMemo, useRef } from 'react'
import { Group, Text, Box, Checkbox, Popover, ScrollArea } from '@mantine/core'
import { TbClock } from 'react-icons/tb'

interface TimeRangePickerProps {
  allDay: boolean
  onAllDayChange: (val: boolean) => void
  startTime: string
  endTime: string
  onStartTimeChange: (val: string) => void
  onEndTimeChange: (val: string) => void
}

const formatDurationLabel = (diffMinutes: number): string => {
  if (diffMinutes < 60) {
    return `${diffMinutes} min`
  }
  const hours = diffMinutes / 60
  if (Number.isInteger(hours)) {
    return `${hours} h`
  }
  if (diffMinutes % 30 === 0) {
    return `${hours.toString().replace('.', ',')} h`
  }
  const h = Math.floor(diffMinutes / 60)
  const m = diffMinutes % 60
  return `${h} h ${m} min`
}

const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

const minutesToTimeString = (totalMinutes: number): string => {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440
  const h = Math.floor(normalized / 60)
  const m = normalized % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export const TimeRangePicker = ({
  allDay,
  onAllDayChange,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange
}: TimeRangePickerProps) => {
  const [isEndMenuOpen, setIsEndMenuOpen] = useState(false)
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false)
  const endInputRef = useRef<HTMLInputElement>(null)

  // Lista de sugestões de horários iniciais a cada 15 ou 30 min
  const startTimeOptions = useMemo(() => {
    const list: string[] = []
    for (let m = 0; m < 1440; m += 30) {
      list.push(minutesToTimeString(m))
    }
    return list
  }, [])

  // Lista de sugestões de horários finais calculados relativamente ao horário inicial
  const endTimeOptions = useMemo(() => {
    const baseMinutes = startTime ? parseTimeToMinutes(startTime) : 480 // 08:00 default
    const options: { time: string; durationLabel: string; isSelected: boolean }[] = []

    // Intervalos pré-definidos: 15m, 30m, 45m, 1h, 1h15m, 1h30m, 1h45m, 2h, 2h30m, 3h, ... até 12h
    const minuteSteps = [
      15, 30, 45, 60, 75, 90, 105, 120, 150, 180, 210, 240, 300, 360, 420, 480, 540, 600, 720
    ]

    for (const step of minuteSteps) {
      const targetMinutes = baseMinutes + step
      const timeStr = minutesToTimeString(targetMinutes)
      options.push({
        time: timeStr,
        durationLabel: formatDurationLabel(step),
        isSelected: endTime === timeStr
      })
    }

    return options
  }, [startTime, endTime])

  const handleSelectStartTime = (time: string) => {
    onStartTimeChange(time)
    setIsStartMenuOpen(false)

    // Se não tiver endTime ou se endTime for antes do novo startTime, ajusta para 1h depois
    const currentEndMin = endTime ? parseTimeToMinutes(endTime) : null
    const newStartMin = parseTimeToMinutes(time)

    if (currentEndMin === null || currentEndMin <= newStartMin) {
      onEndTimeChange(minutesToTimeString(newStartMin + 60))
    }
  }

  const handleSelectEndTime = (time: string) => {
    onEndTimeChange(time)
    setIsEndMenuOpen(false)
  }

  // Duração atual calculada
  const currentDuration = useMemo(() => {
    if (!startTime || !endTime) return null
    const startMin = parseTimeToMinutes(startTime)
    const endMin = parseTimeToMinutes(endTime)
    let diff = endMin - startMin
    if (diff <= 0) diff += 1440
    return formatDurationLabel(diff)
  }, [startTime, endTime])

  return (
    <Box>
      <Group justify="space-between" align="center" mb={6}>
        <Text size="xs" fw={500} c="#d1d5db">
          Horário
        </Text>
        <Checkbox
          size="xs"
          label="Dia inteiro"
          checked={allDay}
          onChange={(e) => onAllDayChange(e.currentTarget.checked)}
          styles={{
            label: { color: '#9ca3af', fontSize: 12, cursor: 'pointer' },
            input: { cursor: 'pointer' }
          }}
        />
      </Group>

      {!allDay ? (
        <Group grow align="center" gap="md">
          {/* Seletor Horário Início */}
          <Popover
            opened={isStartMenuOpen}
            onChange={setIsStartMenuOpen}
            position="bottom-start"
            shadow="xl"
            width="target"
          >
            <Popover.Target>
              <Box
                onClick={() => setIsStartMenuOpen((o) => !o)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: isStartMenuOpen ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 10,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  height: 42,
                  transition: 'all 0.15s ease'
                }}
              >
                <Group gap={8} wrap="nowrap">
                  <TbClock size={16} color="#9ca3af" />
                  <Text size="sm" fw={500} c={startTime ? '#ffffff' : '#9ca3af'}>
                    {startTime || '00:00'}
                  </Text>
                </Group>
                <Text size="xs" c="dimmed" fw={400}>
                  Início
                </Text>
              </Box>
            </Popover.Target>
            <Popover.Dropdown
              p={4}
              style={{
                backgroundColor: '#1c1f26',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 8,
                boxShadow: '0 12px 28px rgba(0, 0, 0, 0.6)'
              }}
            >
              <ScrollArea.Autosize mah={220} type="auto">
                {startTimeOptions.map((time) => {
                  const isSelected = time === startTime
                  return (
                    <Box
                      key={time}
                      onClick={() => handleSelectStartTime(time)}
                      px="sm"
                      py={6}
                      style={{
                        borderRadius: 6,
                        cursor: 'pointer',
                        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                        color: isSelected ? '#ffffff' : '#d1d5db',
                        fontWeight: isSelected ? 600 : 400,
                        fontSize: 13,
                        transition: 'background-color 0.1s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)'
                        }
                      }}
                    >
                      {time}
                    </Box>
                  )
                })}
              </ScrollArea.Autosize>
            </Popover.Dropdown>
          </Popover>

          {/* Seletor Horário Término com Duração Relativa */}
          <Popover
            opened={isEndMenuOpen}
            onChange={setIsEndMenuOpen}
            position="bottom-start"
            shadow="xl"
            width="target"
          >
            <Popover.Target>
              <Box
                ref={endInputRef}
                onClick={() => setIsEndMenuOpen((o) => !o)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: isEndMenuOpen ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 10,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  height: 42,
                  transition: 'all 0.15s ease'
                }}
              >
                <Group gap={8} wrap="nowrap">
                  <Text size="sm" fw={500} c={endTime ? '#ffffff' : '#9ca3af'}>
                    {endTime || (startTime ? minutesToTimeString(parseTimeToMinutes(startTime) + 60) : '01:00')}
                  </Text>
                  {currentDuration && (
                    <Text
                      size="xs"
                      c="#9ca3af"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        padding: '1px 6px',
                        borderRadius: 4,
                        fontSize: 11
                      }}
                    >
                      {currentDuration}
                    </Text>
                  )}
                </Group>
                <Text size="xs" c="dimmed" fw={400}>
                  Término
                </Text>
              </Box>
            </Popover.Target>
            <Popover.Dropdown
              p={4}
              style={{
                backgroundColor: '#1c1f26',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 8,
                boxShadow: '0 12px 28px rgba(0, 0, 0, 0.6)',
                minWidth: 200
              }}
            >
              <ScrollArea.Autosize mah={240} type="auto">
                {endTimeOptions.map((opt) => {
                  return (
                    <Box
                      key={opt.time}
                      onClick={() => handleSelectEndTime(opt.time)}
                      px="sm"
                      py={7}
                      style={{
                        borderRadius: 6,
                        cursor: 'pointer',
                        backgroundColor: opt.isSelected ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                        color: opt.isSelected ? '#ffffff' : '#d1d5db',
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        transition: 'background-color 0.1s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.08)'
                        }
                      }}
                    >
                      <Text size="13px" fw={opt.isSelected ? 600 : 400} c="inherit">
                        {opt.time}
                      </Text>
                      <Text size="12px" c="dimmed">
                        ({opt.durationLabel})
                      </Text>
                    </Box>
                  )
                })}
              </ScrollArea.Autosize>
            </Popover.Dropdown>
          </Popover>
        </Group>
      ) : (
        <Box
          style={{
            height: 42,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 10,
            border: '1px dashed rgba(255, 255, 255, 0.08)'
          }}
        >
          <TbClock size={15} color="#6b7280" />
          <Text size="xs" c="dimmed">
            Dia inteiro (sem horário fixo definido)
          </Text>
        </Box>
      )}
    </Box>
  )
}

export default TimeRangePicker
