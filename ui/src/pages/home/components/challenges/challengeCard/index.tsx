import { useState } from 'react'
import { Box, Group, Stack, Text, Progress, Badge, Tooltip } from '@mantine/core'
import { TbFlame, TbTrophy, TbCalendar, TbCheck, TbChevronRight, TbNotes } from 'react-icons/tb'

import Button from '@components/ui/button'
import { calculateChallengeStats, formatDisplayDate } from '@stores/challenges/utils'

import type { Challenge } from '@actions/challenges/types'

interface ChallengeCardProps {
  challenge: Challenge
  onOpenDetails: (challenge: Challenge) => void
  onToggleCheckin: (id: string) => Promise<unknown>
  isLoading?: boolean
}

export const ChallengeCard = ({
  challenge,
  onOpenDetails,
  onToggleCheckin,
  isLoading = false
}: ChallengeCardProps) => {
  const [isToggling, setIsToggling] = useState(false)
  const stats = calculateChallengeStats(challenge)
  const isCompleted = challenge.status === 'completed'
  const isStreakMode = challenge.type === 'streak'

  const handleActionClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsToggling(true)
    try {
      await onToggleCheckin(challenge.id)
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <Box
      onClick={() => onOpenDetails(challenge)}
      style={{
        padding: '16px 18px',
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: stats.isCompletedToday
          ? '1px solid rgba(16, 185, 129, 0.35)'
          : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: stats.isCompletedToday
          ? '0 4px 20px rgba(16, 185, 129, 0.08)'
          : '0 4px 16px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Glow de fundo */}
      <Box
        style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: stats.isCompletedToday
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <Stack gap="xs">
        {/* Cabeçalho do Card */}
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap="xs" align="center" style={{ minWidth: 0, flex: 1 }}>
            <Box
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(129, 140, 248, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                flexShrink: 0
              }}
            >
              {challenge.emoji}
            </Box>
            <Box style={{ minWidth: 0, flex: 1 }}>
              <Text fw={700} size="sm" c="white" truncate>
                {challenge.title}
              </Text>
              <Group gap={6} mt={2} wrap="wrap">
                <Badge
                  size="xs"
                  variant="light"
                  color={isCompleted ? 'teal' : isStreakMode ? 'orange' : 'indigo'}
                >
                  {isCompleted ? 'Concluído' : isStreakMode ? 'Ofensiva' : 'Acumulativo'}
                </Badge>
                {challenge.checklist && challenge.checklist.length > 0 && (
                  <Badge size="xs" variant="outline" color="teal">
                    ☑ {challenge.checklist.filter((i) => i.completed).length}/{challenge.checklist.length}
                  </Badge>
                )}
                {challenge.notes && (
                  <Tooltip label="Possui anotações e regras" withArrow>
                    <Box style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <TbNotes size={13} color="#94a3b8" />
                    </Box>
                  </Tooltip>
                )}
                <Text size="11px" c="dimmed">
                  Dia {stats.completedDays} de {stats.targetDays}
                </Text>
              </Group>
            </Box>
          </Group>

          <Badge
            size="md"
            variant="gradient"
            gradient={
              isCompleted
                ? { from: 'teal', to: 'green', deg: 90 }
                : { from: 'indigo', to: 'cyan', deg: 90 }
            }
          >
            {stats.percentage}%
          </Badge>
        </Group>

        {/* Motivação curta se houver */}
        {challenge.motivation && (
          <Text size="11px" c="dimmed" lineClamp={1} style={{ fontStyle: 'italic' }}>
            "{challenge.motivation}"
          </Text>
        )}

        {/* Barra de Progresso */}
        <Box mt={2}>
          <Progress
            value={stats.percentage}
            size="sm"
            radius="xl"
            color={isCompleted ? 'teal' : 'indigo'}
            striped={stats.percentage > 0 && !isCompleted}
            animated={stats.isCompletedToday && !isCompleted}
          />
        </Box>

        {/* Estatísticas Chave */}
        <Group justify="space-between" align="center" mt={4} wrap="wrap">
          <Group gap={4}>
            <TbFlame size={15} color={stats.streak > 0 ? '#f97316' : 'rgba(255, 255, 255, 0.4)'} />
            <Text size="xs" fw={600} c={stats.streak > 0 ? 'orange.4' : 'dimmed'}>
              {stats.streak} {stats.streak === 1 ? 'dia' : 'dias'} de ofensiva
            </Text>
          </Group>

          {isStreakMode && stats.freezeDaysPerMonth > 0 && (
            <Tooltip
              label={
                stats.isFrozenToday
                  ? 'Hoje está congelado! O streak não será quebrado.'
                  : `${stats.freezesRemainingThisMonth} de ${stats.freezeDaysPerMonth} dias livres restantes neste mês`
              }
              withArrow
            >
              <Text
                size="11px"
                fw={600}
                c={stats.isFrozenToday ? 'cyan.3' : stats.freezesRemainingThisMonth > 0 ? 'dimmed' : 'red.4'}
                style={{
                  backgroundColor: stats.isFrozenToday ? 'rgba(6, 182, 212, 0.15)' : undefined,
                  padding: stats.isFrozenToday ? '1px 6px' : undefined,
                  borderRadius: 6
                }}
              >
                ❄️ {stats.isFrozenToday ? 'Hoje Congelado' : `${stats.freezesRemainingThisMonth}/${stats.freezeDaysPerMonth} livres`}
              </Text>
            </Tooltip>
          )}

          <Tooltip label={`Previsão de conclusão da meta: ${formatDisplayDate(stats.estimatedEndDate)}`} withArrow>
            <Group gap={4}>
              <TbCalendar size={14} color="rgba(255, 255, 255, 0.4)" />
              <Text size="xs" c="dimmed">
                Meta: {formatDisplayDate(stats.estimatedEndDate)}
              </Text>
            </Group>
          </Tooltip>
        </Group>
      </Stack>

      {/* Botões de Ação */}
      <Group gap="xs" mt="md" justify="space-between">
        <Button
          size="sm"
          variant="primary"
          onClick={handleActionClick}
          isLoading={isToggling || isLoading}
          leftIcon={stats.isCompletedToday ? <TbCheck size={14} /> : <TbTrophy size={14} />}
          style={{
            flex: 1,
            backgroundColor: stats.isCompletedToday ? '#059669' : undefined,
            borderColor: stats.isCompletedToday ? '#10b981' : undefined
          }}
        >
          {stats.isCompletedToday ? 'Concluído Hoje ✓' : 'Resisti Hoje ✓'}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => onOpenDetails(challenge)}
          rightIcon={<TbChevronRight size={14} />}
        >
          Grade
        </Button>
      </Group>
    </Box>
  )
}

export default ChallengeCard
