import { RingProgress, SimpleGrid, Group, Stack, Title, Text, Box } from '@mantine/core'
import { TbCalendarCheck, TbTarget } from 'react-icons/tb'

import Badge from '@components/ui/badge'
import Card from '@components/ui/card'

import type { HabitsScoreCardProps } from './types'

export const HabitsScoreCard = ({
  totalHabits,
  completedHabits,
  completionRate,
  isLoading
}: HabitsScoreCardProps) => {
  const getProgressColor = () => {
    if (totalHabits === 0) return 'gray'
    if (completionRate === 100) return 'teal'
    if (completionRate >= 80) return 'indigo'
    if (completionRate >= 50) return 'cyan'
    return 'yellow'
  }

  const getStatusBadge = () => {
    if (totalHabits === 0) return { label: 'Sem metas para o dia', variant: 'default' as const }
    if (completionRate === 100) return { label: 'Perfeito! 100% cumprido', variant: 'success' as const }
    if (completionRate >= 80) return { label: 'Excelente aproveitamento', variant: 'primary' as const }
    if (completionRate >= 50) return { label: 'Bom progresso diário', variant: 'info' as const }
    if (completionRate > 0) return { label: 'Metas em andamento', variant: 'warning' as const }
    return { label: 'Aguardando conclusões', variant: 'default' as const }
  }

  const status = getStatusBadge()

  return (
    <Card>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" style={{ alignItems: 'center' }}>
        <Group gap="xl" wrap="nowrap">
          <RingProgress
            size={120}
            thickness={12}
            roundCaps
            sections={[{ value: isLoading ? 0 : completionRate, color: getProgressColor() }]}
            label={
              <Text ta="center" fw={700} size="lg" c="white">
                {isLoading ? '...' : `${completionRate}%`}
              </Text>
            }
          />

          <Stack gap={4}>
            <Badge variant={status.variant}>
              {status.label}
            </Badge>
            <Title order={3} fw={700} c="white">
              {completedHabits} de {totalHabits} cumpridas
            </Title>
            <Text size="sm" c="dimmed">
              Aproveitamento calculado com base em todas as metas ativas da data.
            </Text>
          </Stack>
        </Group>

        <SimpleGrid cols={2} spacing="md">
          <Box p="md" style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <Group gap="xs" mb={4}>
              <TbTarget size={18} color="#818cf8" />
              <Text size="xs" c="dimmed" fw={600}>
                TOTAL PLANEJADO
              </Text>
            </Group>
            <Text size="xl" fw={700} c="white">
              {totalHabits}
            </Text>
            <Text size="xs" c="dimmed">
              Metas ativas para hoje
            </Text>
          </Box>

          <Box p="md" style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <Group gap="xs" mb={4}>
              <TbCalendarCheck size={18} color="#2dd4bf" />
              <Text size="xs" c="dimmed" fw={600}>
                CONCLUÍDAS
              </Text>
            </Group>
            <Text size="xl" fw={700} c="teal">
              {completedHabits}
            </Text>
            <Text size="xs" c="dimmed">
              Itens finalizados com sucesso
            </Text>
          </Box>
        </SimpleGrid>
      </SimpleGrid>
    </Card>
  )
}

export default HabitsScoreCard
