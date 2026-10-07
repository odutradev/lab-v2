import { Group, Text, Box } from '@mantine/core'
import { TbChevronLeft, TbChevronRight, TbPlus } from 'react-icons/tb'

import Button from '@components/ui/button'
import ActionIcon from '@components/ui/actionIcon'
import SegmentedControl from '@components/ui/segmentedControl'

import type { HabitsCalendarToolbarProps } from './types'
import type { CalendarViewMode } from '@pages/habits/types'

const TOOLBAR_CONTROL_HEIGHT = 34

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
    <Box
      pb="md"
      style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}
    >
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Group gap="xs" align="center">
          <Button
            variant={isToday ? 'outline' : 'secondary'}
            size="sm"
            h={TOOLBAR_CONTROL_HEIGHT}
            onClick={onToday}
          >
            Hoje
          </Button>

          <Group gap={4}>
            <ActionIcon
              variant="subtle"
              size="md"
              h={TOOLBAR_CONTROL_HEIGHT}
              w={TOOLBAR_CONTROL_HEIGHT}
              radius="md"
              onClick={onPrevious}
              aria-label="Período anterior"
            >
              <TbChevronLeft size={18} />
            </ActionIcon>

            <ActionIcon
              variant="subtle"
              size="md"
              h={TOOLBAR_CONTROL_HEIGHT}
              w={TOOLBAR_CONTROL_HEIGHT}
              radius="md"
              onClick={onNext}
              aria-label="Próximo período"
            >
              <TbChevronRight size={18} />
            </ActionIcon>
          </Group>

          <Text fw={700} size="md" c="white" ml="xs">
            {headerTitle}
          </Text>
        </Group>

        <Group gap="sm" align="center">
          <SegmentedControl
            value={viewMode}
            onChange={(val) => onViewModeChange(val as CalendarViewMode)}
            data={viewModeOptions}
            size="sm"
            height={TOOLBAR_CONTROL_HEIGHT}
            radius="md"
          />

          <Button
            variant="primary"
            size="sm"
            h={TOOLBAR_CONTROL_HEIGHT}
            leftIcon={<TbPlus size={16} />}
            onClick={onOpenNewHabitModal}
          >
            Novo Item
          </Button>
        </Group>
      </Group>
    </Box>
  )
}

export default HabitsCalendarToolbar
