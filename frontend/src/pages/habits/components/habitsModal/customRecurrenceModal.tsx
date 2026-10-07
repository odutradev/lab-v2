import { Modal, Stack, Group, Text, Radio, ActionIcon, NumberInput, TextInput, Box } from '@mantine/core'
import { useState } from 'react'

import Button from '@components/ui/button'
import Select from '@components/ui/select'

import type { HabitRecurrence } from '@actions/habits/types'

interface CustomRecurrenceModalProps {
  isOpen: boolean
  initialRecurrence?: HabitRecurrence
  baseDate: string
  onClose: () => void
  onConfirm: (recurrence: HabitRecurrence) => void
}

const dayLetters = [
  { dayIndex: 0, label: 'D', full: 'Domingo' },
  { dayIndex: 1, label: 'S', full: 'Segunda-feira' },
  { dayIndex: 2, label: 'T', full: 'Terça-feira' },
  { dayIndex: 3, label: 'Q', full: 'Quarta-feira' },
  { dayIndex: 4, label: 'Q', full: 'Quinta-feira' },
  { dayIndex: 5, label: 'S', full: 'Sexta-feira' },
  { dayIndex: 6, label: 'S', full: 'Sábado' }
]

const unitOptions = [
  { value: 'day', label: 'dia' },
  { value: 'week', label: 'semana' },
  { value: 'month', label: 'mês' }
]

export const CustomRecurrenceModal = ({
  isOpen,
  initialRecurrence,
  baseDate,
  onClose,
  onConfirm
}: CustomRecurrenceModalProps) => {
  const [interval, setInterval] = useState<number>(initialRecurrence?.interval ?? 1)
  const [unit, setUnit] = useState<'day' | 'week' | 'month'>(initialRecurrence?.unit ?? 'week')
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(() => {
    if (initialRecurrence?.daysOfWeek && initialRecurrence.daysOfWeek.length > 0) {
      return initialRecurrence.daysOfWeek
    }
    const [y, m, d] = baseDate.split('-').map(Number)
    return [new Date(y, m - 1, d).getDay()]
  })
  const [endType, setEndType] = useState<'never' | 'on_date' | 'after_occurrences'>(
    initialRecurrence?.endType ?? 'never'
  )
  const [endDate, setEndDate] = useState<string>(() => {
    if (initialRecurrence?.endDate) return initialRecurrence.endDate
    const [y, m, d] = baseDate.split('-').map(Number)
    const future = new Date(y, m - 1 + 3, d)
    const fY = future.getFullYear()
    const fM = String(future.getMonth() + 1).padStart(2, '0')
    const fD = String(future.getDate()).padStart(2, '0')
    return `${fY}-${fM}-${fD}`
  })
  const [occurrences, setOccurrences] = useState<number>(initialRecurrence?.occurrences ?? 13)

  const toggleDay = (dayIndex: number) => {
    setDaysOfWeek((prev) => {
      if (prev.includes(dayIndex)) {
        if (prev.length === 1) return prev
        return prev.filter((d) => d !== dayIndex)
      }
      return [...prev, dayIndex].sort((a, b) => a - b)
    })
  }

  const handleSave = () => {
    const recurrenceData: HabitRecurrence = {
      type: 'custom',
      interval,
      unit,
      daysOfWeek: unit === 'week' ? daysOfWeek : undefined,
      endType,
      endDate: endType === 'on_date' ? endDate : undefined,
      occurrences: endType === 'after_occurrences' ? occurrences : undefined
    }
    onConfirm(recurrenceData)
  }

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Recorrência personalizada"
      centered
      radius="lg"
      size="sm"
      styles={{
        content: {
          backgroundColor: '#1e1f20',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          color: '#e3e3e3'
        },
        header: {
          backgroundColor: '#1e1f20',
          borderBottom: 'none',
          paddingBottom: 4
        },
        title: {
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '1.15rem'
        }
      }}
    >
      <Stack gap="lg" mt="xs">
        {/* Repetir a cada: [ 1 ] [ semana v ] */}
        <Group align="center" gap="xs">
          <Text size="sm" c="#c4c7c5">
            Repetir a cada:
          </Text>
          <NumberInput
            value={interval}
            onChange={(val) => setInterval(typeof val === 'number' && val > 0 ? val : 1)}
            min={1}
            max={99}
            w={70}
            styles={{
              input: {
                backgroundColor: '#2b2c2f',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                textAlign: 'center'
              }
            }}
          />
          <Box style={{ flex: 1 }}>
            <Select
              value={unit}
              onChange={(e) => setUnit(e.target.value as 'day' | 'week' | 'month')}
              options={unitOptions}
            />
          </Box>
        </Group>

        {/* Repetir dias (se semana) */}
        {unit === 'week' && (
          <Stack gap={8}>
            <Text size="sm" c="#c4c7c5">
              Repetir:
            </Text>
            <Group gap={6} justify="space-between">
              {dayLetters.map(({ dayIndex, label, full }) => {
                const isSelected = daysOfWeek.includes(dayIndex)
                return (
                  <ActionIcon
                    key={dayIndex}
                    size={36}
                    radius="xl"
                    variant={isSelected ? 'filled' : 'subtle'}
                    onClick={() => toggleDay(dayIndex)}
                    title={full}
                    style={{
                      backgroundColor: isSelected ? '#a8c7fa' : 'rgba(255, 255, 255, 0.05)',
                      color: isSelected ? '#041e49' : '#c4c7c5',
                      fontWeight: 700,
                      fontSize: 13,
                      border: isSelected ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    {label}
                  </ActionIcon>
                )
              })}
            </Group>
          </Stack>
        )}

        {/* Termina em */}
        <Stack gap="xs">
          <Text size="sm" c="#c4c7c5">
            Termina em
          </Text>

          <Radio.Group value={endType} onChange={(val) => setEndType(val as typeof endType)}>
            <Stack gap="sm">
              <Radio
                value="never"
                label="Nunca"
                styles={{
                  label: { color: '#e3e3e3', fontSize: 14 }
                }}
              />

              <Group gap="xs" align="center">
                <Radio
                  value="on_date"
                  label="Em"
                  styles={{
                    label: { color: '#e3e3e3', fontSize: 14 }
                  }}
                />
                <TextInput
                  type="date"
                  value={endDate}
                  disabled={endType !== 'on_date'}
                  onChange={(e) => setEndDate(e.target.value)}
                  size="xs"
                  styles={{
                    input: {
                      backgroundColor: endType === 'on_date' ? '#2b2c2f' : 'rgba(255, 255, 255, 0.04)',
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      color: endType === 'on_date' ? '#ffffff' : '#75777a',
                      maxWidth: 150
                    }
                  }}
                />
              </Group>

              <Group gap="xs" align="center">
                <Radio
                  value="after_occurrences"
                  label="Após"
                  styles={{
                    label: { color: '#e3e3e3', fontSize: 14 }
                  }}
                />
                <NumberInput
                  value={occurrences}
                  disabled={endType !== 'after_occurrences'}
                  onChange={(val) => setOccurrences(typeof val === 'number' && val > 0 ? val : 1)}
                  min={1}
                  max={999}
                  w={75}
                  size="xs"
                  styles={{
                    input: {
                      backgroundColor: endType === 'after_occurrences' ? '#2b2c2f' : 'rgba(255, 255, 255, 0.04)',
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      color: endType === 'after_occurrences' ? '#ffffff' : '#75777a',
                      textAlign: 'center'
                    }
                  }}
                />
                <Text size="sm" c={endType === 'after_occurrences' ? '#e3e3e3' : '#75777a'}>
                  ocorrências
                </Text>
              </Group>
            </Stack>
          </Radio.Group>
        </Stack>

        {/* Rodapé Cancelar / Concluir */}
        <Group justify="flex-end" gap="sm" mt="sm">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            style={{
              backgroundColor: '#a8c7fa',
              color: '#041e49',
              borderRadius: 20,
              fontWeight: 600,
              paddingLeft: 20,
              paddingRight: 20
            }}
          >
            Concluir
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

export default CustomRecurrenceModal
