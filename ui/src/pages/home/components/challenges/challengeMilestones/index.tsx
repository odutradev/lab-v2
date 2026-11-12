import { SimpleGrid, Box, Text, Group, ThemeIcon, Progress } from '@mantine/core'
import { TbCheck } from 'react-icons/tb'

import type { ChallengeMilestone } from '@stores/challenges/utils'

interface ChallengeMilestonesProps {
  milestones: ChallengeMilestone[]
  completedDays: number
}

export const ChallengeMilestones = ({ milestones, completedDays }: ChallengeMilestonesProps) => {
  return (
    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
      {milestones.map((m) => {
        const isAchieved = m.achieved
        const progressPct = Math.min(100, Math.round((completedDays / m.days) * 100))

        return (
          <Box
            key={m.days}
            style={{
              padding: '12px',
              borderRadius: 12,
              backgroundColor: isAchieved ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
              border: isAchieved ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Group justify="space-between" align="center" mb={6}>
              <Text size="xl">{m.emoji}</Text>
              {isAchieved ? (
                <ThemeIcon size="xs" radius="xl" color="teal" variant="light">
                  <TbCheck size={12} />
                </ThemeIcon>
              ) : (
                <Text size="xs" c="dimmed" fw={600}>
                  {m.days}d
                </Text>
              )}
            </Group>

            <Box>
              <Text size="xs" fw={700} c={isAchieved ? 'teal.3' : 'white'} lineClamp={1}>
                {m.title}
              </Text>
              <Text size="10px" c="dimmed" mt={2}>
                {isAchieved ? 'Conquistado! 🎉' : `Faltam ${m.remainingDays}d`}
              </Text>
              {!isAchieved && (
                <Progress
                  value={progressPct}
                  size="xs"
                  mt={6}
                  radius="xl"
                  color="indigo"
                />
              )}
            </Box>
          </Box>
        )
      })}
    </SimpleGrid>
  )
}

export default ChallengeMilestones
