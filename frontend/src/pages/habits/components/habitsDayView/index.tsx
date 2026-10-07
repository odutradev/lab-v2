import { ActionIcon, Stack, Group, Text, Box, Loader } from '@mantine/core'
import { TbCheck, TbCircle, TbClock, TbPencil, TbTrash, TbCalendarEvent } from 'react-icons/tb'

import Badge from '@components/ui/badge'
import Card from '@components/ui/card'

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

  const getFrequencyBadge = (freq: string) => {
    switch (freq) {
      case 'daily':
        return <Badge variant="primary">Diária</Badge>
      case 'weekly':
        return <Badge variant="info">Semanal</Badge>
      case 'monthly':
        return <Badge variant="warning">Mensal</Badge>
      default:
        return <Badge variant="default">{freq}</Badge>
    }
  }

  return (
    <Card>
      <Group justify="space-between" align="center" pb="sm" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <Group gap="xs">
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
            {completedHabits}/{totalHabits} concluídas • {completionRate}%
          </Badge>
        )}
      </Group>

      <Box pt="md">
        {isLoading && items.length === 0 ? (
          <Group justify="center" py="xl">
            <Loader color="indigo" size="sm" />
          </Group>
        ) : items.length === 0 ? (
          <Stack align="center" justify="center" py="xl" gap="xs">
            <Text size="sm" c="dimmed">
              Nenhuma meta cadastrada para este dia.
            </Text>
          </Stack>
        ) : (
          <Stack gap="xs">
            {items.map((item) => {
              const isToggling = togglingId === item.habitId

              return (
                <Box
                  key={item.habitId}
                  p="sm"
                  style={{
                    background: item.completed ? 'rgba(45, 212, 191, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: item.completed ? '1px solid rgba(45, 212, 191, 0.25)' : '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 10,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Group justify="space-between" align="center" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
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

                    <Group gap="xs" wrap="nowrap">
                      {getFrequencyBadge(item.frequency || 'daily')}

                      {onEditItem && (
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="gray"
                          onClick={() => onEditItem(item.habitId, selectedDate)}
                          aria-label="Editar meta"
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
                          aria-label="Excluir meta"
                        >
                          <TbTrash size={15} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Group>
                </Box>
              )
            })}
          </Stack>
        )}
      </Box>
    </Card>
  )
}

export default HabitsDayView
