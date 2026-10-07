import { Modal, Stack, Group, Text, TextInput, Textarea, Box, SimpleGrid } from '@mantine/core'
import { useState, useEffect } from 'react'
import { TbCalendar, TbClock, TbTrash, TbCheck } from 'react-icons/tb'

import Button from '@components/ui/button'

import type { HabitsModalProps } from './types'
import type { HabitFrequency, HabitRecurrence } from '@actions/habits/types'

const getTodayString = (): string => {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const weekDayOptions = [
  { label: 'Dom', index: 0, title: 'Domingo' },
  { label: 'Seg', index: 1, title: 'Segunda' },
  { label: 'Ter', index: 2, title: 'Terça' },
  { label: 'Qua', index: 3, title: 'Quarta' },
  { label: 'Qui', index: 4, title: 'Quinta' },
  { label: 'Sex', index: 5, title: 'Sexta' },
  { label: 'Sáb', index: 6, title: 'Sábado' }
]

const frequencyCards: { value: HabitFrequency; label: string; desc: string }[] = [
  { value: 'daily', label: 'Diária', desc: 'Todos os dias' },
  { value: 'weekly', label: 'Semanal', desc: 'Dias selecionados' },
  { value: 'monthly', label: 'Mensal', desc: 'Uma vez ao mês' }
]

export const HabitsModal = ({
  isOpen,
  isLoading,
  initialDate,
  initialHabit,
  onClose,
  onSubmit,
  onDelete
}: HabitsModalProps) => {
  const [title, setTitle] = useState(initialHabit?.title || '')
  const [description, setDescription] = useState(initialHabit?.description || '')
  const [frequency, setFrequency] = useState<HabitFrequency>(
    initialHabit?.frequency === 'weekly' || initialHabit?.frequency === 'monthly'
      ? initialHabit.frequency
      : 'daily'
  )
  const [startDate, setStartDate] = useState<string>(
    initialHabit?.startDate || initialDate || getTodayString()
  )
  const [startTime, setStartTime] = useState(initialHabit?.startTime || '')
  const [endTime, setEndTime] = useState(initialHabit?.endTime || '')
  const [selectedDays, setSelectedDays] = useState<number[]>(() => {
    if (initialHabit?.recurrence?.daysOfWeek && initialHabit.recurrence.daysOfWeek.length > 0) {
      return initialHabit.recurrence.daysOfWeek
    }
    const [y, m, d] = (initialDate || getTodayString()).split('-').map(Number)
    return [new Date(y, m - 1, d).getDay()]
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialHabit) {
      setTitle(initialHabit.title || '')
      setDescription(initialHabit.description || '')
      setFrequency(
        initialHabit.frequency === 'weekly' || initialHabit.frequency === 'monthly'
          ? initialHabit.frequency
          : 'daily'
      )
      setStartDate(initialHabit.startDate || initialDate || getTodayString())
      setStartTime(initialHabit.startTime || '')
      setEndTime(initialHabit.endTime || '')
      if (initialHabit.recurrence?.daysOfWeek && initialHabit.recurrence.daysOfWeek.length > 0) {
        setSelectedDays(initialHabit.recurrence.daysOfWeek)
      } else {
        const [y, m, d] = (initialHabit.startDate || initialDate || getTodayString())
          .split('-')
          .map(Number)
        setSelectedDays([new Date(y, m - 1, d).getDay()])
      }
    } else {
      setTitle('')
      setDescription('')
      setFrequency('daily')
      const defaultDate = initialDate || getTodayString()
      setStartDate(defaultDate)
      setStartTime('')
      setEndTime('')
      const [y, m, d] = defaultDate.split('-').map(Number)
      setSelectedDays([new Date(y, m - 1, d).getDay()])
      setError('')
    }
  }, [initialHabit, initialDate, isOpen])

  const handleClose = () => {
    setError('')
    onClose()
  }

  const toggleDay = (dayIndex: number) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayIndex)) {
        if (prev.length === 1) return prev // Mantém pelo menos um dia
        return prev.filter((d) => d !== dayIndex)
      }
      return [...prev, dayIndex].sort((a, b) => a - b)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Informe o título da meta')
      return
    }

    const [y, m, d] = startDate.split('-').map(Number)
    const fallbackDay = new Date(y, m - 1, d).getDay()

    const finalRecurrence: HabitRecurrence =
      frequency === 'daily'
        ? { type: 'daily', interval: 1 }
        : frequency === 'weekly'
          ? {
              type: 'weekly',
              interval: 1,
              daysOfWeek: selectedDays.length > 0 ? selectedDays : [fallbackDay]
            }
          : { type: 'monthly', interval: 1 }

    const cleanStartTime = startTime && startTime.trim() ? startTime.trim() : undefined
    const cleanEndTime = endTime && endTime.trim() ? endTime.trim() : undefined

    await onSubmit({
      title: title.trim(),
      description: description.trim() ? description.trim() : undefined,
      frequency,
      startDate,
      allDay: !cleanStartTime,
      startTime: cleanStartTime,
      endTime: cleanEndTime,
      recurrence: finalRecurrence
    })

    handleClose()
  }

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      title={
        <Box>
          <Text fw={600} size="lg" c="white">
            {initialHabit ? 'Editar Meta' : 'Nova Meta'}
          </Text>
          <Text size="xs" c="dimmed">
            {initialHabit
              ? 'Atualize as configurações e a frequência da sua meta.'
              : 'Defina os detalhes e a frequência para acompanhar sua consistência.'}
          </Text>
        </Box>
      }
      centered
      radius="lg"
      size="lg"
      styles={{
        content: {
          backgroundColor: '#161922',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.7)',
          color: '#e5e7eb',
          padding: '20px 24px'
        },
        header: {
          backgroundColor: '#161922',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          paddingBottom: 16,
          marginBottom: 16
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          {/* Título da Meta */}
          <Box>
            <TextInput
              label="Nome da meta"
              placeholder="Ex: Treino de perna, Ler 20 páginas, Meditar..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (error) setError('')
              }}
              error={error}
              size="md"
              required
              styles={{
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  borderColor: error ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: 15,
                  borderRadius: 10,
                  '&:focus': {
                    borderColor: '#6366f1'
                  }
                },
                label: {
                  color: '#d1d5db',
                  fontSize: 13,
                  fontWeight: 500,
                  marginBottom: 6
                }
              }}
            />
          </Box>

          {/* Seletor Minimalista de Frequência */}
          <Box>
            <Text size="xs" fw={500} c="#d1d5db" mb={8}>
              Frequência da meta
            </Text>
            <SimpleGrid cols={3} spacing="sm">
              {frequencyCards.map((card) => {
                const isSelected = frequency === card.value
                return (
                  <Box
                    key={card.value}
                    onClick={() => setFrequency(card.value)}
                    p="sm"
                    style={{
                      borderRadius: 10,
                      cursor: 'pointer',
                      backgroundColor: isSelected
                        ? 'rgba(99, 102, 241, 0.14)'
                        : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected
                        ? '1px solid #6366f1'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2
                    }}
                  >
                    <Group justify="space-between" align="center" wrap="nowrap">
                      <Text
                        size="sm"
                        fw={600}
                        c={isSelected ? '#ffffff' : '#e5e7eb'}
                      >
                        {card.label}
                      </Text>
                      {isSelected && <TbCheck size={16} color="#818cf8" />}
                    </Group>
                    <Text size="11px" c={isSelected ? '#c7d2fe' : 'dimmed'}>
                      {card.desc}
                    </Text>
                  </Box>
                )
              })}
            </SimpleGrid>
          </Box>

          {/* Configuração de dias para Semanal */}
          {frequency === 'weekly' && (
            <Box
              p="sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 10,
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <Text size="xs" fw={500} c="#9ca3af" mb={8}>
                Dias da semana em que a meta se repete
              </Text>
              <Group gap="xs">
                {weekDayOptions.map((opt) => {
                  const isSelected = selectedDays.includes(opt.index)
                  return (
                    <Box
                      key={opt.index}
                      onClick={() => toggleDay(opt.index)}
                      px={14}
                      py={6}
                      style={{
                        borderRadius: 20,
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 600,
                        backgroundColor: isSelected ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
                        color: isSelected ? '#ffffff' : '#9ca3af',
                        border: isSelected ? '1px solid #818cf8' : '1px solid transparent',
                        transition: 'all 0.15s ease'
                      }}
                      title={opt.title}
                    >
                      {opt.label}
                    </Box>
                  )
                })}
              </Group>
            </Box>
          )}

          {/* Data de Início e Horários */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
            <Box>
              <TextInput
                type="date"
                label="Data de início"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                size="sm"
                leftSection={<TbCalendar size={16} color="#9ca3af" />}
                styles={{
                  input: {
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontSize: 14,
                    borderRadius: 10
                  },
                  label: {
                    color: '#d1d5db',
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 6
                  }
                }}
              />
            </Box>

            <Box>
              <TextInput
                type="time"
                label="Horário (opcional)"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                size="sm"
                leftSection={<TbClock size={16} color="#9ca3af" />}
                styles={{
                  input: {
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontSize: 14,
                    borderRadius: 10
                  },
                  label: {
                    color: '#d1d5db',
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 6
                  }
                }}
              />
            </Box>

            <Box>
              <TextInput
                type="time"
                label="Término (opcional)"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                size="sm"
                styles={{
                  input: {
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontSize: 14,
                    borderRadius: 10
                  },
                  label: {
                    color: '#d1d5db',
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 6
                  }
                }}
              />
            </Box>
          </SimpleGrid>

          {/* Descrição Opcional */}
          <Box>
            <Textarea
              label="Descrição ou observações (opcional)"
              placeholder="Adicione detalhes, metas numéricas ou anotações..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minRows={2}
              maxRows={4}
              autosize
              styles={{
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#e5e7eb',
                  fontSize: 14,
                  borderRadius: 10
                },
                label: {
                  color: '#d1d5db',
                  fontSize: 13,
                  fontWeight: 500,
                  marginBottom: 6
                }
              }}
            />
          </Box>

          {/* Rodapé com Ações */}
          <Group justify="space-between" align="center" mt="xs" pt="md" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            {initialHabit && onDelete ? (
              <Button
                variant="ghost"
                color="red"
                leftIcon={<TbTrash size={16} />}
                onClick={() => onDelete(initialHabit.id)}
                disabled={isLoading}
              >
                Excluir meta
              </Button>
            ) : (
              <Box />
            )}

            <Group gap="sm">
              <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={isLoading}
                style={{
                  borderRadius: 10,
                  fontWeight: 600,
                  paddingLeft: 24,
                  paddingRight: 24
                }}
              >
                {initialHabit ? 'Salvar alterações' : 'Criar Meta'}
              </Button>
            </Group>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

export default HabitsModal
