import { useState, useMemo } from 'react'
import { Group, Text, Box, Popover, UnstyledButton } from '@mantine/core'
import { TbChevronDown, TbChevronUp } from 'react-icons/tb'

import CustomRecurrenceModal from './customRecurrenceModal'
import type { HabitRecurrence } from '@actions/habits/types'

interface RecurrenceSelectProps {
  startDate: string
  recurrence?: HabitRecurrence
  onChange: (rec: HabitRecurrence) => void
}

const weekdayNames = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado'
]

const monthNames = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro'
]

const getOrdinalWeek = (dayOfMonth: number): string => {
  if (dayOfMonth <= 7) return 'primeiro(a)'
  if (dayOfMonth <= 14) return 'segundo(a)'
  if (dayOfMonth <= 21) return 'terceiro(a)'
  if (dayOfMonth <= 28) return 'quarto(a)'
  return 'último(a)'
}

export const RecurrenceSelect = ({
  startDate,
  recurrence,
  onChange
}: RecurrenceSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)

  const dateInfo = useMemo(() => {
    const [y, m, d] = (startDate || '2026-01-01').split('-').map(Number)
    const dateObj = new Date(y, m - 1, d)
    const dayOfWeek = dateObj.getDay()
    const weekdayName = weekdayNames[dayOfWeek]
    const ordinal = getOrdinalWeek(d)
    const monthName = monthNames[m - 1]

    return {
      dayOfWeek,
      weekdayName,
      ordinal,
      monthName,
      dayNumber: d
    }
  }, [startDate])

  const presetOptions = useMemo(() => {
    return [
      {
        id: 'none',
        label: 'Não se repete',
        recurrence: { type: 'none' as const }
      },
      {
        id: 'daily',
        label: 'Todos os dias',
        recurrence: { type: 'daily' as const, interval: 1 }
      },
      {
        id: 'weekly',
        label: `Semanal: cada ${dateInfo.weekdayName}`,
        recurrence: {
          type: 'weekly' as const,
          interval: 1,
          daysOfWeek: [dateInfo.dayOfWeek]
        }
      },
      {
        id: 'monthly',
        label: `Mensal no(a) ${dateInfo.ordinal} ${dateInfo.weekdayName}`,
        recurrence: { type: 'monthly' as const, interval: 1 }
      },
      {
        id: 'yearly',
        label: `Anual em ${dateInfo.monthName} ${dateInfo.dayNumber}`,
        recurrence: { type: 'yearly' as const, interval: 1 }
      },
      {
        id: 'weekdays',
        label: 'Todos os dias da semana (segunda a sexta-feira)',
        recurrence: {
          type: 'weekly' as const,
          interval: 1,
          daysOfWeek: [1, 2, 3, 4, 5]
        }
      }
    ]
  }, [dateInfo])

  const currentLabel = useMemo(() => {
    if (!recurrence || recurrence.type === 'none') {
      return 'Não se repete'
    }

    if (recurrence.type === 'custom') {
      const unitLabel =
        recurrence.unit === 'day'
          ? 'dias'
          : recurrence.unit === 'month'
            ? 'meses'
            : recurrence.unit === 'year'
              ? 'anos'
              : 'semanas'
      const interval = recurrence.interval ?? 1
      return `Personalizado: a cada ${interval} ${unitLabel}`
    }

    if (recurrence.type === 'daily') {
      return 'Todos os dias'
    }

    if (recurrence.type === 'weekly') {
      const days = recurrence.daysOfWeek || []
      if (days.length === 5 && [1, 2, 3, 4, 5].every((d) => days.includes(d))) {
        return 'Todos os dias da semana (segunda a sexta-feira)'
      }
      return `Semanal: cada ${dateInfo.weekdayName}`
    }

    if (recurrence.type === 'monthly') {
      return `Mensal no(a) ${dateInfo.ordinal} ${dateInfo.weekdayName}`
    }

    if (recurrence.type === 'yearly') {
      return `Anual em ${dateInfo.monthName} ${dateInfo.dayNumber}`
    }

    return 'Não se repete'
  }, [recurrence, dateInfo])

  const handleSelectPreset = (rec: HabitRecurrence) => {
    onChange(rec)
    setIsOpen(false)
  }

  const handleOpenCustom = () => {
    setIsOpen(false)
    setIsCustomModalOpen(true)
  }

  const handleSaveCustom = (customRec: HabitRecurrence) => {
    onChange(customRec)
    setIsCustomModalOpen(false)
  }

  return (
    <Box>
      <Text size="xs" fw={500} c="#d1d5db" mb={6}>
        Repetição
      </Text>

      <Popover
        opened={isOpen}
        onChange={setIsOpen}
        position="bottom-start"
        shadow="xl"
        width="target"
      >
        <Popover.Target>
          <UnstyledButton
            onClick={() => setIsOpen((o) => !o)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: isOpen ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 10,
              padding: '8px 12px',
              cursor: 'pointer',
              height: 42,
              transition: 'all 0.15s ease'
            }}
          >
            <Text size="sm" fw={500} c="#ffffff" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentLabel}
            </Text>
            {isOpen ? <TbChevronUp size={16} color="#9ca3af" /> : <TbChevronDown size={16} color="#9ca3af" />}
          </UnstyledButton>
        </Popover.Target>

        <Popover.Dropdown
          p={6}
          style={{
            backgroundColor: '#1c1f26',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 8,
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.7)',
            minWidth: 280
          }}
        >
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {presetOptions.map((opt) => {
              const isSelected = currentLabel === opt.label
              return (
                <Box
                  key={opt.id}
                  onClick={() => handleSelectPreset(opt.recurrence)}
                  px="md"
                  py={8}
                  style={{
                    borderRadius: 6,
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                    color: isSelected ? '#ffffff' : '#d1d5db',
                    fontSize: 13,
                    fontWeight: isSelected ? 600 : 400,
                    transition: 'background-color 0.1s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)'
                    }
                  }}
                >
                  <Text size="13px" c="inherit" fw={isSelected ? 600 : 400}>
                    {opt.label}
                  </Text>
                </Box>
              )
            })}

            <Box
              my={4}
              style={{
                height: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.08)'
              }}
            />

            <Box
              onClick={handleOpenCustom}
              px="md"
              py={8}
              style={{
                borderRadius: 6,
                cursor: 'pointer',
                backgroundColor: recurrence?.type === 'custom' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                color: recurrence?.type === 'custom' ? '#818cf8' : '#d1d5db',
                fontSize: 13,
                fontWeight: 500,
                transition: 'background-color 0.1s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)'
                }
              }}
            >
              <Group justify="space-between" align="center">
                <Text size="13px" c="inherit">
                  Personalizar...
                </Text>
              </Group>
            </Box>
          </Box>
        </Popover.Dropdown>
      </Popover>

      <CustomRecurrenceModal
        isOpen={isCustomModalOpen}
        initialRecurrence={recurrence}
        baseDate={startDate}
        onClose={() => setIsCustomModalOpen(false)}
        onConfirm={handleSaveCustom}
      />
    </Box>
  )
}

export default RecurrenceSelect
