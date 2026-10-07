import { Modal, Stack, Group, Text, TextInput, Checkbox, Textarea, Box } from '@mantine/core'
import { useState, useMemo } from 'react'
import { TbClock } from 'react-icons/tb'

import Button from '@components/ui/button'
import Select from '@components/ui/select'

import CustomRecurrenceModal from './customRecurrenceModal'
import type { HabitsModalProps } from './types'
import type { HabitCategory, HabitFrequency, HabitRecurrence } from '@actions/habits/types'

const formatDateGoogleStyle = (dateStr: string): string => {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' })
  const monthName = date.toLocaleDateString('pt-BR', { month: 'long' })
  const formattedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1)
  return `${formattedWeekday}, ${day} de ${monthName}`
}

const getWeekdayName = (dateStr: string): string => {
  if (!dateStr) return 'semana'
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('pt-BR', { weekday: 'long' })
}

const getTodayString = (): string => {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export const HabitsModal = ({
  isOpen,
  isLoading,
  initialDate,
  onClose,
  onSubmit
}: HabitsModalProps) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<HabitCategory>('event')
  const [startDate, setStartDate] = useState<string>(initialDate || getTodayString())
  const [allDay, setAllDay] = useState(false)
  const [startTime, setStartTime] = useState('22:00')
  const [endTime, setEndTime] = useState('23:00')
  const [recurrenceOption, setRecurrenceOption] = useState<string>('none')
  const [customRecurrence, setCustomRecurrence] = useState<HabitRecurrence | null>(null)
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)
  const [error, setError] = useState('')

  const [prevInitialDate, setPrevInitialDate] = useState(initialDate)
  if (initialDate !== prevInitialDate) {
    setPrevInitialDate(initialDate)
    if (initialDate) {
      setStartDate(initialDate)
    }
  }

  const weekdayName = useMemo(() => getWeekdayName(startDate), [startDate])
  const formattedGoogleDate = useMemo(() => formatDateGoogleStyle(startDate), [startDate])

  const recurrenceSelectOptions = useMemo(() => {
    return [
      { value: 'none', label: 'Não se repete' },
      { value: 'daily', label: 'Todos os dias' },
      { value: 'weekly', label: `A cada semana (às ${weekdayName})` },
      { value: 'monthly', label: 'Todos os meses' },
      { value: 'custom', label: customRecurrence ? 'Personalizado (configurado)' : 'Personalizado...' }
    ]
  }, [weekdayName, customRecurrence])

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setCategory('event')
    setAllDay(false)
    setStartTime('22:00')
    setEndTime('23:00')
    setRecurrenceOption('none')
    setCustomRecurrence(null)
    setIsCustomModalOpen(false)
    setError('')
    onClose()
  }

  const handleRecurrenceChange = (value: string) => {
    if (value === 'custom') {
      setIsCustomModalOpen(true)
    } else {
      setRecurrenceOption(value)
      setCustomRecurrence(null)
    }
  }

  const handleConfirmCustomRecurrence = (rec: HabitRecurrence) => {
    setCustomRecurrence(rec)
    setRecurrenceOption('custom')
    setIsCustomModalOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Adicione um título')
      return
    }

    let finalRecurrence: HabitRecurrence | undefined
    let frequency: HabitFrequency = 'daily'

    if (recurrenceOption === 'custom' && customRecurrence) {
      finalRecurrence = customRecurrence
      frequency = 'custom'
    } else if (recurrenceOption === 'none') {
      finalRecurrence = { type: 'none' }
      frequency = 'none'
    } else if (recurrenceOption === 'daily') {
      finalRecurrence = { type: 'daily', interval: 1 }
      frequency = 'daily'
    } else if (recurrenceOption === 'weekly') {
      const [y, m, d] = startDate.split('-').map(Number)
      const dayIndex = new Date(y, m - 1, d).getDay()
      finalRecurrence = { type: 'weekly', interval: 1, daysOfWeek: [dayIndex] }
      frequency = 'weekly'
    } else if (recurrenceOption === 'monthly') {
      finalRecurrence = { type: 'monthly', interval: 1 }
      frequency = 'monthly'
    }

    await onSubmit({
      title: title.trim(),
      description: description.trim() ? description.trim() : undefined,
      category,
      frequency,
      startDate,
      allDay,
      startTime: allDay ? undefined : startTime,
      endTime: allDay ? undefined : endTime,
      recurrence: finalRecurrence
    })

    handleClose()
  }

  return (
    <>
      <Modal
        opened={isOpen}
        onClose={handleClose}
        withCloseButton={true}
        centered
        radius="lg"
        size="md"
        styles={{
          content: {
            backgroundColor: '#1f1f1f',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.7)',
            color: '#e3e3e3',
            padding: 8
          },
          header: {
            backgroundColor: '#1f1f1f',
            borderBottom: 'none',
            paddingTop: 12,
            paddingRight: 16
          }
        }}
      >
        <form onSubmit={handleSubmit}>
          <Stack gap="md" px="xs" pb="xs">
            {/* Campo de Título Estilo Google Calendar */}
            <Box>
              <TextInput
                placeholder="Adicionar título"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (error) setError('')
                }}
                error={error}
                variant="unstyled"
                styles={{
                  input: {
                    color: '#ffffff',
                    fontSize: 22,
                    fontWeight: 500,
                    padding: '8px 4px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 0,
                    '&:focus': {
                      borderBottom: '2px solid #1a73e8'
                    }
                  }
                }}
              />
            </Box>

            {/* Segmentos tipo Pill: [ Evento ] [ Tarefa ] [ Agendamento de horários ] */}
            <Group gap="xs">
              {[
                { key: 'event', label: 'Evento' },
                { key: 'task', label: 'Tarefa' },
                { key: 'schedule', label: 'Agendamento de horários' }
              ].map((pill) => {
                const isSelected = category === pill.key
                return (
                  <Box
                    key={pill.key}
                    onClick={() => setCategory(pill.key as HabitCategory)}
                    px={14}
                    py={6}
                    style={{
                      borderRadius: 20,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      backgroundColor: isSelected ? '#0b57d0' : 'rgba(255, 255, 255, 0.06)',
                      color: isSelected ? '#ffffff' : '#c4c7c5',
                      border: isSelected ? '1px solid #1a73e8' : '1px solid transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {pill.label}
                  </Box>
                )
              })}
            </Group>

            {/* Linha com Ícone de Relógio e Horários */}
            <Group align="center" gap="sm" wrap="nowrap" mt={4}>
              <Box style={{ color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                <TbClock size={20} />
              </Box>

              {/* Data formatada com input de date integrado */}
              <Box style={{ position: 'relative' }}>
                <Box
                  px={12}
                  py={6}
                  style={{
                    backgroundColor: '#2b2c2f',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 6,
                    color: '#e3e3e3',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  {formattedGoogleDate}
                </Box>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
              </Box>

              {!allDay && (
                <>
                  <TextInput
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    size="xs"
                    w={82}
                    styles={{
                      input: {
                        backgroundColor: '#2b2c2f',
                        borderColor: 'rgba(255, 255, 255, 0.12)',
                        color: '#ffffff',
                        textAlign: 'center',
                        fontSize: 13
                      }
                    }}
                  />

                  <Text size="sm" c="dimmed">
                    –
                  </Text>

                  <TextInput
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    size="xs"
                    w={82}
                    styles={{
                      input: {
                        backgroundColor: '#2b2c2f',
                        borderColor: 'rgba(255, 255, 255, 0.12)',
                        color: '#ffffff',
                        textAlign: 'center',
                        fontSize: 13
                      }
                    }}
                  />
                </>
              )}
            </Group>

            {/* Checkbox "Dia inteiro" e "Fuso horário" */}
            <Group gap="lg" pl={28}>
              <Checkbox
                checked={allDay}
                onChange={(e) => setAllDay(e.currentTarget.checked)}
                label="Dia inteiro"
                styles={{
                  label: { color: '#e3e3e3', fontSize: 13, cursor: 'pointer' }
                }}
              />
              <Text size="xs" c="#a8c7fa" style={{ cursor: 'pointer' }}>
                Fuso horário (Brasília)
              </Text>
            </Group>

            {/* Dropdown de Recorrência */}
            <Box pl={28} style={{ maxWidth: 260 }}>
              <Select
                value={recurrenceOption}
                onChange={(e) => handleRecurrenceChange(e.target.value)}
                options={recurrenceSelectOptions}
              />
            </Box>

            {/* Campo opcional de Descrição */}
            <Box pl={28} mt={4}>
              <Textarea
                placeholder="Adicionar descrição ou observações"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                styles={{
                  input: {
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#e3e3e3',
                    fontSize: 13
                  }
                }}
              />
            </Box>

            {/* Botões do Rodapé */}
            <Group justify="flex-end" gap="sm" mt="md">
              <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={isLoading}
                style={{
                  backgroundColor: '#a8c7fa',
                  color: '#041e49',
                  borderRadius: 20,
                  fontWeight: 600,
                  paddingLeft: 22,
                  paddingRight: 22
                }}
              >
                Salvar
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Submodal de Recorrência Personalizada */}
      {isCustomModalOpen && (
        <CustomRecurrenceModal
          isOpen={isCustomModalOpen}
          initialRecurrence={customRecurrence || undefined}
          baseDate={startDate}
          onClose={() => {
            setIsCustomModalOpen(false)
            if (!customRecurrence) {
              setRecurrenceOption('none')
            }
          }}
          onConfirm={handleConfirmCustomRecurrence}
        />
      )}
    </>
  )
}

export default HabitsModal
