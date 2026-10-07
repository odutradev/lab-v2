import { Modal, Stack, Group, Text, TextInput, Textarea, Box, SegmentedControl } from '@mantine/core'
import { useState, useEffect } from 'react'
import { TbCalendar, TbTrash, TbRepeat, TbChecklist, TbCalendarTime } from 'react-icons/tb'

import Button from '@components/ui/button'
import TimeRangePicker from './timeRangePicker'
import RecurrenceSelect from './recurrenceSelect'

import type { HabitsModalProps } from './types'
import type { HabitCategory, HabitFrequency, HabitRecurrence } from '@actions/habits/types'

const getTodayString = (): string => {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const itemTypeOptions: { value: HabitCategory; label: string; icon: typeof TbRepeat; desc: string }[] = [
  {
    value: 'habit',
    label: 'Hábito',
    icon: TbRepeat,
    desc: 'Atividades frequentes para construir consistência e rotina'
  },
  {
    value: 'task',
    label: 'Tarefa',
    icon: TbChecklist,
    desc: 'Itens e pendências a serem concluídos'
  },
  {
    value: 'schedule',
    label: 'Agenda',
    icon: TbCalendarTime,
    desc: 'Compromissos, reuniões e eventos com horário definido'
  }
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
  const normalizeCategory = (cat?: string): HabitCategory => {
    if (cat === 'task') return 'task'
    if (cat === 'schedule') return 'schedule'
    return 'habit'
  }

  const [category, setCategory] = useState<HabitCategory>('habit')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState(getTodayString())
  const [allDay, setAllDay] = useState(false)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [recurrence, setRecurrence] = useState<HabitRecurrence>({ type: 'daily', interval: 1 })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return

    if (initialHabit) {
      const cat = normalizeCategory(initialHabit.category)
      setCategory(cat)
      setTitle(initialHabit.title || '')
      setDescription(initialHabit.description || '')
      setStartDate(initialHabit.startDate || initialDate || getTodayString())
      setAllDay(Boolean(initialHabit.allDay))
      setStartTime(initialHabit.startTime || '')
      setEndTime(initialHabit.endTime || '')

      if (initialHabit.recurrence && initialHabit.recurrence.type) {
        setRecurrence(initialHabit.recurrence)
      } else if (initialHabit.frequency && initialHabit.frequency !== 'none') {
        setRecurrence({ type: initialHabit.frequency as HabitRecurrence['type'], interval: 1 })
      } else {
        setRecurrence({ type: 'none' })
      }
    } else {
      setCategory('habit')
      setTitle('')
      setDescription('')
      const defaultDate = initialDate || getTodayString()
      setStartDate(defaultDate)
      setAllDay(false)
      setStartTime('')
      setEndTime('')
      // Para Hábito, padrão é repetir diariamente; para tarefa/agenda padrão é não repetir
      setRecurrence({ type: 'daily', interval: 1 })
      setError('')
    }
  }, [initialHabit, initialDate, isOpen])

  const handleCategoryChange = (newCat: HabitCategory) => {
    setCategory(newCat)
    if (!initialHabit) {
      // Ajusta repetição sugerida com base no tipo
      if (newCat === 'habit') {
        setRecurrence({ type: 'daily', interval: 1 })
      } else {
        setRecurrence({ type: 'none' })
      }
    }
  }

  const handleClose = () => {
    setError('')
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError(`Informe o título ${category === 'habit' ? 'do hábito' : category === 'task' ? 'da tarefa' : 'do compromisso'}`)
      return
    }

    const cleanStartTime = !allDay && startTime && startTime.trim() ? startTime.trim() : null
    const cleanEndTime = !allDay && endTime && endTime.trim() ? endTime.trim() : null

    // Mapeia frequência para manter compatibilidade com sistemas existentes
    let frequency: HabitFrequency = 'none'
    if (recurrence.type === 'daily') frequency = 'daily'
    else if (recurrence.type === 'weekly') frequency = 'weekly'
    else if (recurrence.type === 'monthly') frequency = 'monthly'
    else if (recurrence.type === 'yearly') frequency = 'yearly'
    else if (recurrence.type === 'custom') frequency = 'custom'

    await onSubmit({
      title: title.trim(),
      description: description.trim() ? description.trim() : undefined,
      category,
      frequency,
      startDate,
      allDay,
      startTime: cleanStartTime,
      endTime: cleanEndTime,
      recurrence
    })

    handleClose()
  }

  const currentTypeInfo = itemTypeOptions.find((t) => t.value === category) || itemTypeOptions[0]

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      title={
        <Box>
          <Text fw={600} size="lg" c="white">
            {initialHabit ? `Editar ${currentTypeInfo.label}` : `Novo ${currentTypeInfo.label}`}
          </Text>
          <Text size="xs" c="dimmed">
            {currentTypeInfo.desc}
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
          {/* Seletor de Tipo de Item: Hábito / Tarefa / Agenda */}
          <Box>
            <Text size="xs" fw={500} c="#d1d5db" mb={6}>
              Tipo de item
            </Text>
            <SegmentedControl
              value={category}
              onChange={(val) => handleCategoryChange(val as HabitCategory)}
              fullWidth
              size="sm"
              radius="md"
              data={[
                {
                  value: 'habit',
                  label: (
                    <Group gap={6} justify="center" wrap="nowrap">
                      <TbRepeat size={16} />
                      <Text size="13px" fw={600}>Hábito</Text>
                    </Group>
                  )
                },
                {
                  value: 'task',
                  label: (
                    <Group gap={6} justify="center" wrap="nowrap">
                      <TbChecklist size={16} />
                      <Text size="13px" fw={600}>Tarefa</Text>
                    </Group>
                  )
                },
                {
                  value: 'schedule',
                  label: (
                    <Group gap={6} justify="center" wrap="nowrap">
                      <TbCalendarTime size={16} />
                      <Text size="13px" fw={600}>Agenda</Text>
                    </Group>
                  )
                }
              ]}
              styles={{
                root: {
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: 4
                },
                indicator: {
                  backgroundColor: '#6366f1',
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)'
                },
                label: {
                  color: '#9ca3af',
                  transition: 'color 0.15s ease',
                  '&[data-active]': {
                    color: '#ffffff'
                  }
                }
              }}
            />
          </Box>

          {/* Título do Item */}
          <Box>
            <TextInput
              label={
                category === 'habit'
                  ? 'Nome do hábito'
                  : category === 'task'
                    ? 'Título da tarefa'
                    : 'Título do compromisso'
              }
              placeholder={
                category === 'habit'
                  ? 'Ex: Meditar 15 min, Ler 20 páginas, Treino de musculação...'
                  : category === 'task'
                    ? 'Ex: Enviar relatório trimestral, Pagar fatura do cartão...'
                    : 'Ex: Reunião com diretoria, Consulta médica, Alinhamento de projeto...'
              }
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

          {/* Data de Início e Regras de Repetição (estilo Google Calendar) */}
          <Group grow align="flex-start" gap="md">
            <Box>
              <TextInput
                type="date"
                label="Data"
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
                    height: 42,
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
              <RecurrenceSelect
                startDate={startDate}
                recurrence={recurrence}
                onChange={setRecurrence}
              />
            </Box>
          </Group>

          {/* Horários com cálculo de duração relativa (Imagem 1) */}
          <TimeRangePicker
            allDay={allDay}
            onAllDayChange={setAllDay}
            startTime={startTime}
            endTime={endTime}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
          />

          {/* Descrição Opcional */}
          <Box>
            <Textarea
              label="Descrição ou observações (opcional)"
              placeholder="Adicione detalhes, links, notas ou metas numéricas..."
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
          <Group
            justify="space-between"
            align="center"
            mt="xs"
            pt="md"
            style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}
          >
            {initialHabit && onDelete ? (
              <Button
                variant="ghost"
                color="red"
                leftIcon={<TbTrash size={16} />}
                onClick={() => onDelete(initialHabit.id)}
                disabled={isLoading}
              >
                Excluir
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
                {initialHabit ? 'Salvar alterações' : `Criar ${currentTypeInfo.label}`}
              </Button>
            </Group>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

export default HabitsModal
