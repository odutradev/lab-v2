import { SimpleGrid, ActionIcon, Stack, Group, Text, Box } from '@mantine/core'
import { TbCheck, TbCircle } from 'react-icons/tb'

import Badge from '@components/ui/badge'

import type { HabitsWeekViewProps } from './types'

const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

export const HabitsWeekView = ({
  weekDays,
  todayStr,
  rangeSummariesMap,
  selectedDate,
  togglingId,
  onSelectDate,
  onToggleCheckin,
  onEditItem
}: HabitsWeekViewProps) => {

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 4, lg: 7 }} spacing="xs">
        {weekDays.map((dateStr, index) => {
          const summary = rangeSummariesMap.get(dateStr)
          const items = summary?.items ?? []
          const completionRate = summary?.completionRate ?? 0
          const totalHabits = summary?.totalHabits ?? 0
          const completedHabits = summary?.completedHabits ?? 0
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDate
          const dayNumber = Number(dateStr.split('-')[2])

          return (
            <Box
              key={dateStr}
              p="sm"
              style={{
                background: isSelected
                  ? 'rgba(99, 102, 241, 0.1)'
                  : isToday
                    ? 'rgba(99, 102, 241, 0.05)'
                    : 'rgba(255, 255, 255, 0.02)',
                border: isSelected
                  ? '1px solid rgba(129, 140, 248, 0.5)'
                  : isToday
                    ? '1px solid rgba(129, 140, 248, 0.35)'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 10,
                minHeight: 280,
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer'
              }}
              onClick={() => onSelectDate(dateStr)}
            >
              <Stack gap={6} align="center" pb="xs" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <Text size="xs" fw={700} c={isToday ? '#a5b4fc' : 'dimmed'}>
                  {dayNames[index]}
                </Text>

                <Box
                  w={34}
                  h={34}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backgroundColor: isToday ? '#6366f1' : 'transparent',
                    boxShadow: isToday
                      ? '0 0 0 2px rgba(129, 140, 248, 0.6), 0 2px 8px rgba(99, 102, 241, 0.45)'
                      : 'none',
                    color: isToday ? '#ffffff' : '#f3f4f6',
                    fontWeight: isToday ? 800 : 600,
                    fontSize: 14
                  }}
                >
                  {dayNumber}
                </Box>

                <Box>
                  {totalHabits > 0 ? (
                    <Badge variant={completionRate === 100 ? 'success' : completionRate >= 80 ? 'primary' : 'warning'}>
                      {completedHabits}/{totalHabits} • {completionRate}%
                    </Badge>
                  ) : (
                    <Text size="xs" c="dimmed">
                      0 metas
                    </Text>
                  )}
                </Box>
              </Stack>

              <Stack gap={6} mt="xs" style={{ flex: 1 }}>
                {items.length === 0 ? (
                  <Text size="xs" c="dimmed" ta="center" mt="md">
                    Sem metas
                  </Text>
                ) : (
                  items.map((item) => {
                    const isItemToggling = togglingId === item.habitId

                    return (
                      <Box
                        key={item.habitId}
                        p={6}
                        style={{
                          background: item.completed ? 'rgba(45, 212, 191, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                          border: item.completed ? '1px solid rgba(45, 212, 191, 0.3)' : '1px solid rgba(99, 102, 241, 0.25)',
                          borderRadius: 6,
                          transition: 'all 0.15s ease'
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (onEditItem) {
                            onEditItem(item.habitId, dateStr)
                          }
                        }}
                      >
                        <Group justify="space-between" align="center" wrap="nowrap" gap={4}>
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Text
                              size="xs"
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
                              <Text size="10px" fw={700} c={item.completed ? 'dimmed' : '#93c5fd'}>
                                {item.startTime}{item.endTime ? ` – ${item.endTime}` : ''}
                              </Text>
                            ) : null}
                          </Box>

                          <ActionIcon
                            size="xs"
                            variant="subtle"
                            color={item.completed ? 'teal' : 'gray'}
                            loading={isItemToggling}
                            onClick={(e) => {
                              e.stopPropagation()
                              onToggleCheckin(item.habitId, dateStr)
                            }}
                            aria-label="Concluir meta"
                          >
                            {item.completed ? <TbCheck size={14} /> : <TbCircle size={14} />}
                          </ActionIcon>
                        </Group>
                      </Box>
                    )
                  })
                )}
              </Stack>
            </Box>
          )
        })}
      </SimpleGrid>
  )
}

export default HabitsWeekView
