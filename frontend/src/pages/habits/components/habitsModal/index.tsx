import { Modal, Stack, Group, Text, TextInput, Textarea, Box, UnstyledButton } from '@mantine/core'
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

interface ItemTypeConfig {
  value: HabitCategory
  label: string
  titleNew: string
  titleEdit: string
  nameLabel: string
  namePlaceholder: string
  submitText: string
  icon: typeof TbRepeat
  desc: string
}

const itemTypeConfigs: Record<HabitCategory, ItemTypeConfig> = {
  habit: {
    value: 'habit',
    label: 'Hábito',
    titleNew: 'Novo Hábito',
    titleEdit: 'Editar Hábito',
    nameLabel: 'Nome do hábito',
    namePlaceholder: 'Ex: Meditar 15 min, Ler 20 páginas, Treino diário...',
    submitText: 'Criar Hábito',
    icon: TbRepeat,
    desc: 'Atividades frequentes para construir consistência e rotina'
  },
  task: {
    value: 'task',
    label: 'Tarefa',
    titleNew: 'Nova Tarefa',
    titleEdit: 'Editar Tarefa',
    nameLabel: 'Título da tarefa',
    namePlaceholder: 'Ex: Enviar relatório trimestral, Pagar fatura do cartão...',
    submitText: 'Criar Tarefa',
    icon: TbChecklist,
    desc: 'Itens e pendências pontuais a serem concluídos'
  },
  schedule: {
    value: 'schedule',
    label: 'Agenda',
    titleNew: 'Novo Compromisso',
    titleEdit: 'Editar Compromisso',
    nameLabel: 'Título do compromisso',
    namePlaceholder: 'Ex: Reunião com diretoria, Consulta médica, Alinhamento...',
    submitText: 'Criar Compromisso',
    icon: TbCalendarTime,
    desc: 'Compromissos, reuniões e eventos com horário definido'
  },
  event: {
    value: 'event',
    label: 'Agenda',
    titleNew: 'Novo Compromisso',
    titleEdit: 'Editar Compromisso',
    nameLabel: 'Título do compromisso',
    namePlaceholder: 'Ex: Reunião com diretoria, Consulta médica, Alinhamento...',
    submitText: 'Criar Compromisso',
    icon: TbCalendarTime,
    desc: 'Compromissos, reuniões e eventos com horário definido'
  }
}

const availableCategories: HabitCategory[] = ['habit', 'task', 'schedule']

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
      setError(`Informe o ${category === 'habit' ? 'nome do hábito' : category === 'task' ? 'título da tarefa' : 'título do compromisso'}`)
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

  const currentType = itemTypeConfigs[category] || itemTypeConfigs.habit

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      title={
        <Box>
          <Text fw={600} size="lg" c="white">
            {initialHabit ? currentType.titleEdit : currentType.titleNew}
          </Text>
          <Text size="xs" c="dimmed">
            {currentType.desc}
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
          padding: '22px 26px'
        },
        header: {
          backgroundColor: '#161922',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          paddingBottom: 16,
          marginBottom: 18
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {/* Seletor de Tipo de Item: Hábito / Tarefa / Agenda (Minimalista e Harmonioso) */}
          <Box>
            <Text size="xs" fw={500} c="#d1d5db" mb={6}>
              Tipo de item
            </Text>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: 10,
                padding: 3
              }}
            >
              {availableCategories.map((key) => {
                const item = itemTypeConfigs[key]
                const isSelected = item.value === category
                const IconComponent = item.icon
                return (
                  <UnstyledButton
                    key={item.value}
                    type="button"
                    onClick={() => handleCategoryChange(item.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      height: 38,
                      borderRadius: 8,
                      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.10)' : 'transparent',
                      border: isSelected ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid transparent',
                      color: isSelected ? '#ffffff' : '#9ca3af',
                      boxShadow: isSelected ? '0 2px 6px rgba(0, 0, 0, 0.25)' : 'none',
                      fontWeight: isSelected ? 600 : 500,
                      fontSize: 13,
                      transition: 'all 0.15s ease',
                      cursor: 'pointer'
                    }}
                  >
                    <IconComponent size={16} color={isSelected ? '#a5b4fc' : '#6b7280'} />
                    <span>{item.label}</span>
                  </UnstyledButton>
                )
              })}
            </Box>
          </Box>

          {/* Título do Item */}
          <Box>
            <TextInput
              label={currentType.nameLabel}
              placeholder={currentType.namePlaceholder}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (error) setError('')
              }}
              error={error}
              size="sm"
              required
              styles={{
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  borderColor: error ? '#ef4444' : 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  fontSize: 14,
                  height: 42,
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

          {/* Bloco Temporal: Data e Repetição (50% / 50%) */}
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
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    fontSize: 14,
                    height: 42,
                    borderRadius: 10,
                    colorScheme: 'dark'
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

          {/* Bloco Temporal: Horários (Início 50% / Término 50% ou Dia Inteiro) */}
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
              placeholder="Adicione detalhes, notas ou metas adicionais..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minRows={2}
              maxRows={4}
              autosize
              styles={{
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
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
                  paddingLeft: 22,
                  paddingRight: 22
                }}
              >
                {initialHabit ? 'Salvar alterações' : currentType.submitText}
              </Button>
            </Group>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

export default HabitsModal
