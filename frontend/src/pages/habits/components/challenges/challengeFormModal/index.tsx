import { useState, useEffect } from 'react'
import { Stack, Text, Group, Box, TextInput, Textarea, NumberInput, SegmentedControl, Switch, UnstyledButton } from '@mantine/core'
import { TbTarget, TbFlame, TbTrophy } from 'react-icons/tb'

import Modal from '@components/ui/modal'
import Button from '@components/ui/button'
import { getTodayDateString } from '@stores/challenges/utils'

import type { Challenge, ChallengeType, CreateChallengePayload } from '@actions/challenges/types'

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
  const [targetDays, setTargetDays] = useState<number | string>(90)
  const [startDate, setStartDate] = useState(getTodayDateString())
  const [type, setType] = useState<ChallengeType>('streak')
  const [resetOnMiss, setResetOnMiss] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialChallenge) {
      setEmoji(initialChallenge.emoji || '🎯')
      setTitle(initialChallenge.title || '')
      setDescription(initialChallenge.description || '')
      setMotivation(initialChallenge.motivation || '')
      setTargetDays(initialChallenge.targetDays || 90)
      setStartDate(initialChallenge.startDate || getTodayDateString())
      setType(initialChallenge.type || 'streak')
      setResetOnMiss(Boolean(initialChallenge.resetOnMiss))
    } else {
      setEmoji('🥤')
      setTitle('')
      setDescription('')
      setMotivation('')
      setTargetDays(90)
      setStartDate(getTodayDateString())
      setType('streak')
      setResetOnMiss(false)
    }
    setError(null)
  }, [initialChallenge, isOpen])

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
        emoji: emoji || '🎯',
        targetDays: numDays,
        startDate: startDate || getTodayDateString(),
        type,
        resetOnMiss
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
          label='Por que comecei? (Gatilho Motivacional)'
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
