import { Group, Text, Box, Tooltip } from '@mantine/core'
import { TbChevronLeft, TbChevronRight, TbPlus, TbSettings, TbMaximize, TbMinimize } from 'react-icons/tb'

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
  isMaximized = false,
  onToggleMaximize,
  onViewModeChange,
  onPrevious,
  onNext,
  onToday,
  onOpenNewHabitModal,
  onOpenSettingsModal
}: HabitsCalendarToolbarProps) => {
  return (
    <Box
      pb="md"
      style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        width: '100%',
        minWidth: 0,
        overflowX: 'auto',
        scrollbarWidth: 'none'
      }}
    >
      <Group
        justify="space-between"
        align="center"
        wrap="nowrap"
        gap="xs"
        style={{ width: '100%', minWidth: 0 }}
      >
        <Group
          gap="xs"
          align="center"
          wrap="nowrap"
          style={{ minWidth: 0, flexShrink: 1, overflow: 'hidden' }}
        >
          <Button
            variant={isToday ? 'outline' : 'secondary'}
            size="sm"
            h={TOOLBAR_CONTROL_HEIGHT}
            onClick={onToday}
            style={{ flexShrink: 0 }}
          >
            Hoje
          </Button>

          <Group gap={2} wrap="nowrap" style={{ flexShrink: 0 }}>
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

          <Text
            fw={700}
            size="md"
            c="white"
            ml={4}
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minWidth: 0
            }}
          >
            {headerTitle}
          </Text>
        </Group>

        <Group
          gap="xs"
          align="center"
          wrap="nowrap"
          style={{ flexShrink: 0 }}
        >
          <Box style={{ flexShrink: 0 }}>
            <SegmentedControl
              value={viewMode}
              onChange={(val) => onViewModeChange(val as CalendarViewMode)}
              data={viewModeOptions}
              size="sm"
              height={TOOLBAR_CONTROL_HEIGHT}
              radius="md"
            />
          </Box>

          <Tooltip label="Configurar agendas" withArrow position="bottom">
            <ActionIcon
              variant="subtle"
              size="md"
              h={TOOLBAR_CONTROL_HEIGHT}
              w={TOOLBAR_CONTROL_HEIGHT}
              radius="md"
              onClick={onOpenSettingsModal}
              aria-label="Configurar agendas"
              style={{ flexShrink: 0 }}
            >
              <TbSettings size={18} />
            </ActionIcon>
          </Tooltip>

          {onToggleMaximize && (
            <Tooltip
              label={isMaximized ? 'Restaurar visualização (Esc)' : 'Maximizar calendário (Modo foco)'}
              withArrow
              position="bottom"
            >
              <ActionIcon
                variant={isMaximized ? 'secondary' : 'subtle'}
                size="md"
                h={TOOLBAR_CONTROL_HEIGHT}
                w={TOOLBAR_CONTROL_HEIGHT}
                radius="md"
                onClick={onToggleMaximize}
                aria-label={isMaximized ? 'Restaurar visualização' : 'Maximizar calendário'}
                style={{ flexShrink: 0 }}
              >
                {isMaximized ? <TbMinimize size={18} /> : <TbMaximize size={18} />}
              </ActionIcon>
            </Tooltip>
          )}

          <Button
            variant="primary"
            size="sm"
            h={TOOLBAR_CONTROL_HEIGHT}
            leftIcon={<TbPlus size={16} />}
            onClick={onOpenNewHabitModal}
            style={{ flexShrink: 0 }}
          >
            Novo Item
          </Button>
        </Group>
      </Group>
    </Box>
  )
}

export default HabitsCalendarToolbar
