import { SegmentedControl, ActionIcon, Title, Group, Stack, Text, Box } from '@mantine/core'
import { TbChevronLeft, TbChevronRight, TbPlus } from 'react-icons/tb'

import Button from '@components/ui/button'

import type { HabitsCalendarToolbarProps } from './types'
import type { CalendarViewMode } from '@pages/habits/types'

const viewModeOptions = [
  { label: 'Diário', value: 'day' },
  { label: 'Semanal', value: 'week' },
  { label: 'Mensal', value: 'month' }
]

export const HabitsCalendarToolbar = ({
  headerTitle,
  viewMode,
  isToday,
  onViewModeChange,
  onPrevious,
  onNext,
  onToday,
  onOpenNewHabitModal
}: HabitsCalendarToolbarProps) => {
  return (
    <Box>
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="md" mb="md">
        <Stack gap={4}>
          <Title order={2} fw={700} c="white" style={{ letterSpacing: '-0.02em' }}>
            Agenda & Calendário de Metas
          </Title>
          <Text size="sm" c="dimmed">
            Visualize e acompanhe o cumprimento das suas metas em formato de calendário diário, semanal ou mensal.
          </Text>
        </Stack>

        <Button
          variant="primary"
          leftIcon={<TbPlus size={18} />}
          onClick={onOpenNewHabitModal}
        >
          Nova Meta
        </Button>
      </Group>

      <Box
        p="sm"
        style={{
          background: 'rgba(17, 24, 39, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          backdropFilter: 'blur(16px)'
        }}
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Group gap="xs" align="center">
            <Button
              variant={isToday ? 'outline' : 'secondary'}
              size="sm"
              onClick={onToday}
            >
              Hoje
            </Button>

            <Group gap={4}>
              <ActionIcon
                variant="subtle"
                size="lg"
                radius="md"
                onClick={onPrevious}
                aria-label="Período anterior"
              >
                <TbChevronLeft size={20} />
              </ActionIcon>

              <ActionIcon
                variant="subtle"
                size="lg"
                radius="md"
                onClick={onNext}
                aria-label="Próximo período"
              >
                <TbChevronRight size={20} />
              </ActionIcon>
            </Group>

            <Text fw={700} size="md" c="white" ml="xs">
              {headerTitle}
            </Text>
          </Group>

          <SegmentedControl
            value={viewMode}
            onChange={(val) => onViewModeChange(val as CalendarViewMode)}
            data={viewModeOptions}
            size="sm"
            radius="md"
            color="indigo"
            styles={{
              root: {
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }
            }}
          />
        </Group>
      </Box>
    </Box>
  )
}

export default HabitsCalendarToolbar
