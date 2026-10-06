import { Modal, Stack, Group } from '@mantine/core'
import { useState } from 'react'

import Select from '@components/ui/select'
import Button from '@components/ui/button'
import Input from '@components/ui/input'

import type { HabitsModalProps } from './types'
import type { HabitFrequency } from '@actions/habits/types'

const frequencyOptions = [
  { value: 'daily', label: 'Diária (Conta todos os dias)' },
  { value: 'weekly', label: 'Semanal (Sob demanda ou agendamento)' },
  { value: 'monthly', label: 'Mensal (Sob demanda ou agendamento)' }
]

export const HabitsModal = ({
  isOpen,
  isLoading,
  onClose,
  onSubmit
}: HabitsModalProps) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState<HabitFrequency>('daily')
  const [error, setError] = useState('')

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setFrequency('daily')
    setError('')
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('O título da meta é obrigatório')
      return
    }

    await onSubmit({
      title: title.trim(),
      description: description.trim() ? description.trim() : undefined,
      frequency
    })

    handleClose()
  }

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      title="Nova Meta ou Checklist"
      centered
      radius="lg"
      styles={{
        content: {
          backgroundColor: '#111827',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)'
        },
        header: {
          backgroundColor: '#111827',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md" mt="xs">
          <Input
            label="Título da meta"
            placeholder="Ex: Treino de 45 minutos"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (error) setError('')
            }}
            error={error}
            required
          />

          <Input
            label="Descrição (opcional)"
            placeholder="Ex: 3 séries de corrida ou esteira"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Select
            label="Frequência"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
            options={frequencyOptions}
            required
          />

          <Group justify="flex-end" mt="md">
            <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>
              Criar Meta
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

export default HabitsModal
