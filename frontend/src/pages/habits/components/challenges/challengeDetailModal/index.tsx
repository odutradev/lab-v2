import { Stack, Text, Group, Box, Badge, ThemeIcon, SimpleGrid } from '@mantine/core'
import { TbFlame, TbTrophy, TbCalendar, TbTrash, TbEdit, TbAlertTriangle, TbCheck, TbQuote } from 'react-icons/tb'

import Modal from '@components/ui/modal'
import Button from '@components/ui/button'
import ChallengeGrid from '../challengeGrid'
import ChallengeMilestones from '../challengeMilestones'
import { calculateChallengeStats, formatDisplayDate } from '@stores/challenges/utils'

import type { Challenge } from '@actions/challenges/types'

interface ChallengeDetailModalProps {
  isOpen: boolean
  challenge: Challenge | null
  onClose: () => void
  onToggleCheckin: (id: string, date?: string) => Promise<unknown>
  onOpenEdit: (challenge: Challenge) => void
  onOpenSlip: (challenge: Challenge) => void
  onRemove: (id: string) => Promise<void>
  isLoading?: boolean
}

export const ChallengeDetailModal = ({
  isOpen,
  challenge,
  onClose,
  onToggleCheckin,
  onOpenEdit,
  onOpenSlip,
  onRemove,
  isLoading = false
}: ChallengeDetailModalProps) => {
  if (!challenge) return null

  const stats = calculateChallengeStats(challenge)
  const isCompleted = challenge.status === 'completed'
  const isStreakMode = challenge.type === 'streak'

  const handleToggleSpecificDate = async (date: string) => {
    await onToggleCheckin(challenge.id, date)
  }

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja remover este desafio? O histórico será excluído.')) {
      await onRemove(challenge.id)
      onClose()
    }
  }

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      size="lg"
      withCloseButton
    >
      <Stack gap="lg">
        {/* Cabeçalho */}
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap="sm" align="center">
            <Box
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(129, 140, 248, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26
              }}
            >
              {challenge.emoji}
            </Box>
            <Box>
              <Group gap="xs" align="center">
                <Text fw={700} size="lg" c="white">
                  {challenge.title}
                </Text>
                {isCompleted ? (
                  <Badge color="teal" variant="light" size="sm">
                    🏆 Concluído!
                  </Badge>
                ) : (
                  <Badge color="indigo" variant="light" size="sm">
                    {isStreakMode ? '🔥 Ofensiva' : '🎯 Acumulativo'}
                  </Badge>
                )}
              </Group>
              <Text size="xs" c="dimmed" mt={2}>
                Início: {formatDisplayDate(challenge.startDate)} • Meta: {challenge.targetDays} dias
              </Text>
            </Box>
          </Group>

          <Group gap="xs">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onOpenEdit(challenge)}
              leftIcon={<TbEdit size={14} />}
            >
              Editar
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={handleDelete}
              leftIcon={<TbTrash size={14} />}
            >
              Excluir
            </Button>
          </Group>
        </Group>

        {/* Motivação "Por que comecei?" */}
        {challenge.motivation && (
          <Box
            style={{
              padding: '12px 16px',
              borderRadius: 12,
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(129, 140, 248, 0.2)'
            }}
          >
            <Group gap="xs" align="flex-start" wrap="nowrap">
              <ThemeIcon size="sm" radius="md" color="indigo" variant="light" mt={2}>
                <TbQuote size={14} />
              </ThemeIcon>
              <Box>
                <Text size="11px" fw={700} c="indigo.3" tt="uppercase" style={{ letterSpacing: '0.04em' }}>
                  Por que comecei?
                </Text>
                <Text size="sm" c="white" style={{ fontStyle: 'italic', lineHeight: 1.4 }}>
                  "{challenge.motivation}"
                </Text>
              </Box>
            </Group>
          </Box>
        )}

        {/* Grid de Métricas Principais */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
          <Box
            style={{
              padding: '12px',
              borderRadius: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <Text size="10px" c="dimmed" fw={600} tt="uppercase">
              Progresso
            </Text>
            <Text size="md" fw={700} c="white" mt={2}>
              {stats.completedDays} / {stats.targetDays}
            </Text>
            <Text size="xs" c="teal.4" fw={600}>
              {stats.percentage}% concluído
            </Text>
          </Box>

          <Box
            style={{
              padding: '12px',
              borderRadius: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <Group justify="space-between" align="center">
              <Text size="10px" c="dimmed" fw={600} tt="uppercase">
                Ofensiva Atual
              </Text>
              <TbFlame size={14} color="#f97316" />
            </Group>
            <Text size="md" fw={700} c="orange.4" mt={2}>
              {stats.streak} dias
            </Text>
            <Text size="xs" c="dimmed">
              {stats.streak > 0 ? 'Sequência ativa 🔥' : 'Comece hoje!'}
            </Text>
          </Box>

          <Box
            style={{
              padding: '12px',
              borderRadius: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <Text size="10px" c="dimmed" fw={600} tt="uppercase">
              Faltam
            </Text>
            <Text size="md" fw={700} c="white" mt={2}>
              {Math.max(0, stats.targetDays - stats.completedDays)} dias
            </Text>
            <Text size="xs" c="dimmed">
              para a vitória final
            </Text>
          </Box>

          <Box
            style={{
              padding: '12px',
              borderRadius: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <Group justify="space-between" align="center">
              <Text size="10px" c="dimmed" fw={600} tt="uppercase">
                Previsão Final
              </Text>
              <TbCalendar size={14} color="#818cf8" />
            </Group>
            <Text size="sm" fw={700} c="indigo.3" mt={2}>
              {formatDisplayDate(stats.estimatedEndDate)}
            </Text>
            <Text size="xs" c="dimmed">
              data estimada
            </Text>
          </Box>
        </SimpleGrid>

        {/* Botão de Check-in em 1 clique */}
        <Group justify="space-between" align="center" wrap="wrap">
          <Button
            size="md"
            variant="primary"
            onClick={() => onToggleCheckin(challenge.id)}
            isLoading={isLoading}
            leftIcon={stats.isCompletedToday ? <TbCheck size={18} /> : <TbTrophy size={18} />}
            style={{
              flex: 1,
              backgroundColor: stats.isCompletedToday ? '#059669' : undefined,
              borderColor: stats.isCompletedToday ? '#10b981' : undefined
            }}
          >
            {stats.isCompletedToday ? '✓ Concluído Hoje (Clique para desmarcar)' : 'Concluir Hoje / Resisti Hoje ✓'}
          </Button>

          {isStreakMode && (
            <Button
              size="md"
              variant="secondary"
              onClick={() => onOpenSlip(challenge)}
              leftIcon={<TbAlertTriangle size={18} color="#f59e0b" />}
            >
              Tive um Deslize
            </Button>
          )}
        </Group>

        {/* Histórico Visual de Dias (Grade estilo GitHub) */}
        <Box>
          <Group justify="space-between" align="center" mb={6}>
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">
              Grade de Constância ({stats.targetDays} Dias)
            </Text>
            <Text size="11px" c="dimmed">
              Clique em um quadrado para alternar o dia
            </Text>
          </Group>
          <ChallengeGrid
            startDate={challenge.startDate}
            targetDays={challenge.targetDays}
            checkins={challenge.checkins}
            slipDates={challenge.slipDates}
            onToggleDate={handleToggleSpecificDate}
          />
        </Box>

        {/* Marcos de Conquista Intermediários */}
        <Box>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={6}>
            Marcos de Conquista
          </Text>
          <ChallengeMilestones
            milestones={stats.milestones}
            completedDays={stats.completedDays}
          />
        </Box>
      </Stack>
    </Modal>
  )
}

export default ChallengeDetailModal
