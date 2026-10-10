import { useState, useEffect } from 'react'
import { Stack, Text, Group, Box, TextInput, Textarea, NumberInput, SegmentedControl, Switch, UnstyledButton, ActionIcon } from '@mantine/core'
import { TbTarget, TbFlame, TbTrophy, TbPlus, TbTrash, TbListCheck, TbNotes } from 'react-icons/tb'

import Modal from '@components/ui/modal'
import Button from '@components/ui/button'
import { getTodayDateString } from '@stores/challenges/utils'

import type { Challenge, ChallengeType, CreateChallengePayload, ChallengeChecklistItem } from '@actions/challenges/types'

interface ChallengeFormModalProps {
  isOpen: boolean
  initialChallenge?: Challenge | null
  onClose: () => void
  onSubmit: (data: CreateChallengePayload) => Promise<void>
  isLoading?: boolean
}

const EMOJI_PRESETS = ['🥤', '🚫', '🏃', '📚', '🧘', '🚭', '🍬', '💧', '💻', '🎯', '🔥', '🥗', '📱', '🏋️']
const TARGET_DAYS_PRESETS = [21, 30, 60, 90, 100]

export const ChallengeFormModal = ({
  isOpen,
  initialChallenge,
  onClose,
  onSubmit,
  isLoading = false
}: ChallengeFormModalProps) => {
  const isEditing = Boolean(initialChallenge)
  const [emoji, setEmoji] = useState('🥤')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [motivation, setMotivation] = useState('')
  const [notes, setNotes] = useState('')
  const [checklist, setChecklist] = useState<ChallengeChecklistItem[]>([])
  const [newChecklistText, setNewChecklistText] = useState('')
  const [targetDays, setTargetDays] = useState<number | string>(90)
  const [startDate, setStartDate] = useState(getTodayDateString())
  const [type, setType] = useState<ChallengeType>('streak')
  const [resetOnMiss, setResetOnMiss] = useState(false)
  const [freezeDaysPerMonth, setFreezeDaysPerMonth] = useState<number>(2)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialChallenge) {
      setEmoji(initialChallenge.emoji || '🎯')
      setTitle(initialChallenge.title || '')
      setDescription(initialChallenge.description || '')
      setMotivation(initialChallenge.motivation || '')
      setNotes(initialChallenge.notes || '')
      setChecklist(initialChallenge.checklist ? [...initialChallenge.checklist] : [])
      setTargetDays(initialChallenge.targetDays || 90)
      setStartDate(initialChallenge.startDate || getTodayDateString())
      setType(initialChallenge.type || 'streak')
      setResetOnMiss(Boolean(initialChallenge.resetOnMiss))
      setFreezeDaysPerMonth(typeof initialChallenge.freezeDaysPerMonth === 'number' ? initialChallenge.freezeDaysPerMonth : 2)
    } else {
      setEmoji('🥤')
      setTitle('')
      setDescription('')
      setMotivation('')
      setNotes('')
      setChecklist([])
      setTargetDays(90)
      setStartDate(getTodayDateString())
      setType('streak')
      setResetOnMiss(false)
      setFreezeDaysPerMonth(2)
    }
    setNewChecklistText('')
    setError(null)
  }, [initialChallenge, isOpen])

  const handleAddChecklistItem = () => {
    const text = newChecklistText.trim()
    if (!text) return
    const newItem: ChallengeChecklistItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      text,
      completed: false
    }
    setChecklist((prev) => [...prev, newItem])
    setNewChecklistText('')
  }

  const handleRemoveChecklistItem = (itemId: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== itemId))
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Informe um título para o desafio')
      return
    }

    const numDays = Number(targetDays)
    if (!numDays || numDays < 1) {
      setError('A meta de dias deve ser de pelo menos 1 dia')
      return
    }

    setError(null)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        motivation: motivation.trim() || undefined,
        notes: notes.trim() || undefined,
        checklist: checklist.length > 0 ? checklist : undefined,
        emoji: emoji || '🎯',
        targetDays: numDays,
        startDate: startDate || getTodayDateString(),
        type,
        resetOnMiss,
        freezeDaysPerMonth: Number(freezeDaysPerMonth)
      })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar o desafio')
    }
  }

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Desafio de Constância' : 'Novo Desafio de Constância'}
      description="Metas de resistência ou vitórias com contagem regressiva e conquista final."
      size="lg"
    >
      <Stack gap="md">
        {/* Escolha do Emoji */}
        <Box>
          <Text size="xs" fw={600} c="dimmed" mb={6}>
            Ícone / Emoji do Desafio
          </Text>
          <Group gap="xs" wrap="wrap">
            {EMOJI_PRESETS.map((item) => (
              <UnstyledButton
                key={item}
                onClick={() => setEmoji(item)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  fontSize: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: emoji === item ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                  border: emoji === item ? '2px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.15s ease'
                }}
              >
                {item}
              </UnstyledButton>
            ))}
          </Group>
        </Box>

        {/* Título */}
        <TextInput
          label="Título do Desafio"
          placeholder="Ex: 90 dias sem refrigerante, 30 dias de corrida..."
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
          styles={{
            input: {
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white'
            }
          }}
        />

        {/* "Por que comecei?" Motivação */}
        <Textarea
          label="Por que comecei? (Gatilho Motivacional)"
          placeholder="Ex: Melhorar digestão, clareza mental e economizar R$ 300 por mês."
          value={motivation}
          onChange={(e) => setMotivation(e.currentTarget.value)}
          minRows={2}
          styles={{
            input: {
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white'
            }
          }}
        />

        {/* Anotações / Regras em Texto */}
        <Textarea
          label={
            <Group gap={6}>
              <TbNotes size={15} color="#818cf8" />
              <span>Anotações / Regras do Desafio (Opcional)</span>
            </Group>
          }
          placeholder="Ex: Permitido chá verde e suco natural; em caso de vontade extrema, beber 500ml de água..."
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
          minRows={2}
          styles={{
            input: {
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white'
            }
          }}
        />

        {/* Checklist do Desafio */}
        <Box>
          <Group justify="space-between" align="center" mb={6}>
            <Group gap={6}>
              <TbListCheck size={16} color="#34d399" />
              <Text size="xs" fw={600} c="dimmed">
                Checklist / Metas do Desafio ({checklist.length})
              </Text>
            </Group>
            {checklist.length > 0 && (
              <Text size="11px" c="dimmed">
                {checklist.filter((i) => i.completed).length}/{checklist.length} concluídos
              </Text>
            )}
          </Group>

          <Group gap="xs" mb="xs">
            <TextInput
              placeholder="Adicionar item à checklist... (Enter para adicionar)"
              value={newChecklistText}
              onChange={(e) => setNewChecklistText(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddChecklistItem()
                }
              }}
              style={{ flex: 1 }}
              styles={{
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }
              }}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAddChecklistItem}
              leftIcon={<TbPlus size={15} />}
            >
              Adicionar
            </Button>
          </Group>

          {checklist.length > 0 && (
            <Stack gap={6} mt="xs">
              {checklist.map((item) => (
                <Group
                  key={item.id}
                  justify="space-between"
                  align="center"
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  <Text size="sm" c="gray.2" style={{ wordBreak: 'break-word', flex: 1 }}>
                    • {item.text}
                  </Text>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="red"
                    onClick={() => handleRemoveChecklistItem(item.id)}
                    title="Remover item"
                  >
                    <TbTrash size={14} />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>
          )}
        </Box>

        {/* Meta de Dias com Presets */}
        <Box>
          <Text size="xs" fw={600} c="dimmed" mb={6}>
            Meta de Dias
          </Text>
          <Group gap="xs" mb="xs">
            {TARGET_DAYS_PRESETS.map((d) => (
              <Button
                key={d}
                size="sm"
                variant={Number(targetDays) === d ? 'primary' : 'secondary'}
                onClick={() => setTargetDays(d)}
              >
                {d} dias
              </Button>
            ))}
          </Group>
          <NumberInput
            value={targetDays}
            onChange={(val) => setTargetDays(val)}
            min={1}
            max={3650}
            styles={{
              input: {
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white'
              }
            }}
          />
        </Box>

        {/* Tipo de Desafio */}
        <Box>
          <Text size="xs" fw={600} c="dimmed" mb={6}>
            Modo do Desafio
          </Text>
          <SegmentedControl
            value={type}
            onChange={(val) => setType(val as ChallengeType)}
            fullWidth
            data={[
              {
                value: 'streak',
                label: (
                  <Group gap={6} justify="center">
                    <TbFlame size={16} />
                    <span>Ofensiva Contínua (Streak)</span>
                  </Group>
                )
              },
              {
                value: 'accumulative',
                label: (
                  <Group gap={6} justify="center">
                    <TbTrophy size={16} />
                    <span>Acumulativo (Vitórias)</span>
                  </Group>
                )
              }
            ]}
          />
          <Text size="xs" c="dimmed" mt={4}>
            {type === 'streak'
              ? 'Foco em não quebrar dias seguidos (ideal para abstinência, jejum, sem açúcar, sem redes sociais).'
              : 'Foco em somar dias com vitória até atingir a meta total (ideal para treinos, leitura, estudos).'}
          </Text>
        </Box>

        {/* Regra de reinício (apenas se streak) */}
        {type === 'streak' && (
          <Switch
            label="Reiniciar a contagem do zero se houver um deslize"
            checked={resetOnMiss}
            onChange={(e) => setResetOnMiss(e.currentTarget.checked)}
            description="Se ativado, perder a sequência exige recomeçar a contagem a partir do dia 1."
          />
        )}

        {/* Dias Livres / Freeze */}
        <Box>
          <Group justify="space-between" align="center" mb={6}>
            <Text size="xs" fw={600} c="dimmed">
              Dias Livres (Freeze ❄️) por Mês: {freezeDaysPerMonth} {freezeDaysPerMonth === 1 ? 'dia' : 'dias'}
            </Text>
            <Text size="11px" c="cyan.4" fw={600}>
              Até 7 dias / mês
            </Text>
          </Group>
          <Group gap="xs" mb="xs">
            {[0, 1, 2, 3, 5, 7].map((num) => (
              <Button
                key={num}
                size="sm"
                variant={Number(freezeDaysPerMonth) === num ? 'primary' : 'secondary'}
                onClick={() => setFreezeDaysPerMonth(num)}
              >
                {num === 0 ? 'Nenhum' : `${num}d`}
              </Button>
            ))}
          </Group>
          <Text size="xs" c="dimmed">
            Permite congelar dias sem quebrar sua sequência contínua de ofensiva (ex: viagens ou aniversários).
          </Text>
        </Box>

        {/* Data de início */}
        <TextInput
          label="Data de Início"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.currentTarget.value)}
          styles={{
            input: {
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white'
            }
          }}
        />

        {error && (
          <Text size="xs" c="red.4">
            {error}
          </Text>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
            leftIcon={<TbTarget size={16} />}
          >
            {isEditing ? 'Salvar Alterações' : 'Criar Desafio'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

export default ChallengeFormModal
