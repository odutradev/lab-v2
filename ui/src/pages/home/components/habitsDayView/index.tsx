import { ActionIcon, Stack, Group, Text, Box, Loader } from '@mantine/core'
import { TbCheck, TbCircle, TbClock, TbPencil, TbTrash, TbCalendarEvent, TbLock } from 'react-icons/tb'

import Badge from '@components/ui/badge'

import type { HabitsDayViewProps } from './types'

export const HabitsDayView = ({
  selectedDate,
  isToday,
  daySummary,
  isLoading,
  togglingId,
  onToggleCheckin,
  onEditItem,
  onRemoveItem
}: HabitsDayViewProps) => {
  const items = daySummary?.items ?? []
  const totalHabits = daySummary?.totalHabits ?? 0
  const completedHabits = daySummary?.completedHabits ?? 0
  const completionRate = daySummary?.completionRate ?? 0

  const getItemTypeBadge = (category?: string) => {
    switch (category) {
      case 'task':
        return <Badge variant="info">Tarefa</Badge>
      case 'schedule':
        return <Badge variant="warning">Agenda</Badge>
      default:
        return <Badge variant="primary">Hábito</Badge>
    }
  }

  const getFrequencyBadge = (freq: string) => {
    switch (freq) {
      case 'daily':
        return <Badge variant="primary">Diária</Badge>
      case 'weekly':
        return <Badge variant="info">Semanal</Badge>
      case 'monthly':
        return <Badge variant="warning">Mensal</Badge>
      case 'yearly':
        return <Badge variant="success">Anual</Badge>
      default:
        return null
    }
  }

  return (
    <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Group justify="space-between" align="center" pb="sm" wrap="wrap" gap="xs" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <Group gap="xs" wrap="wrap">
          <TbCalendarEvent size={20} color="#818cf8" />
          <Text fw={700} size="md" c="white">
            Programação do Dia
          </Text>
          {isToday && (
            <Badge variant="primary">Hoje</Badge>
          )}
        </Group>

        {totalHabits > 0 && (
          <Badge variant={completionRate === 100 ? 'success' : completionRate >= 80 ? 'primary' : 'warning'}>
            {completedHabits}/{totalHabits} concluídos • {completionRate}%
          </Badge>
        )}
      </Group>

      <Box pt="md" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {isLoading && items.length === 0 ? (
          <Group justify="center" py="xl">
            <Loader color="indigo" size="sm" />
          </Group>
        ) : items.length === 0 ? (
          <Stack align="center" justify="center" py="xl" gap="xs">
            <Text size="sm" c="dimmed">
              Nenhum item cadastrado para este dia.
            </Text>
          </Stack>
        ) : (
          <Stack gap="xs">
            {items.map((item) => {
              const isToggling = togglingId === item.habitId
              const isReadOnly = !!item.readOnly
              const itemColor = item.calendarColor || '#6366f1'

              return (
                <Box
                  key={item.habitId}
                  p="sm"
                  style={{
                    background: isReadOnly
                      ? `${itemColor}15`
                      : item.completed
                        ? 'rgba(45, 212, 191, 0.08)'
                        : 'rgba(255, 255, 255, 0.02)',
                    border: isReadOnly
                      ? `1px solid ${itemColor}35`
                      : item.completed
                        ? '1px solid rgba(45, 212, 191, 0.25)'
                        : '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 10,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                    <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 'min(100%, 180px)' }}>
                      {isReadOnly ? (
                        <Box
                          w={14}
                          h={14}
                          style={{
                            borderRadius: '50%',
                            backgroundColor: itemColor,
                            flexShrink: 0,
                            margin: '0 6px 0 2px'
                          }}
                        />
                      ) : (
                        <ActionIcon
                          size="md"
                          variant="subtle"
                          color={item.completed ? 'teal' : 'gray'}
                          loading={isToggling}
                          onClick={() => onToggleCheckin(item.habitId, selectedDate)}
                          aria-label={item.completed ? 'Desmarcar conclusão' : 'Marcar conclusão'}
                        >
                          {item.completed ? <TbCheck size={18} color="#2dd4bf" /> : <TbCircle size={18} />}
                        </ActionIcon>
                      )}

                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text
                          size="sm"
                          fw={600}
                          c={item.completed ? 'dimmed' : 'white'}
                          style={{
                            textDecoration: item.completed ? 'line-through' : 'none',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {item.title}
                        </Text>
                        {item.startTime ? (
                          <Group gap={4} mt={2}>
                            <TbClock size={12} color="#93c5fd" />
                            <Text size="xs" fw={600} c="#93c5fd">
                              {item.startTime}{item.endTime ? ` – ${item.endTime}` : ''}
                            </Text>
                          </Group>
                        ) : null}
                      </Box>
                    </Group>

                    <Group gap="xs" wrap="wrap" style={{ flexShrink: 0 }}>
                      {isReadOnly ? (
                        <>
                          {item.calendarName && (
                            <Badge variant="primary">
                              {item.calendarName}
                            </Badge>
                          )}
                          <Badge variant="warning">
                            <Group gap={4} wrap="nowrap" align="center">
                              <TbLock size={11} />
                              <span>Somente visualização</span>
                            </Group>
                          </Badge>
                        </>
                      ) : (
                        <>
                          {getItemTypeBadge(item.category)}
                          {getFrequencyBadge(item.frequency || 'daily')}

                          {onEditItem && (
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              color="gray"
                              onClick={() => onEditItem(item.habitId, selectedDate)}
                              aria-label="Editar item"
                            >
                              <TbPencil size={15} />
                            </ActionIcon>
                          )}

                          {onRemoveItem && (
                            <ActionIcon
                              size="sm"
                              variant="subtle"
                              color="red"
                              onClick={() => onRemoveItem(item.habitId, selectedDate)}
                              aria-label="Excluir item"
                            >
                              <TbTrash size={15} />
                            </ActionIcon>
                          )}
                        </>
                      )}
                    </Group>
                  </Group>
                </Box>
              )
            })}
          </Stack>
        )}
      </Box>
    </Box>
  )
}

export default HabitsDayView
