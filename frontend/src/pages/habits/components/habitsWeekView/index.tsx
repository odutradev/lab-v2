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
    <SimpleGrid cols={{ base: 1, sm: 2, md: 4, lg: 7 }} spacing="xs" style={{ flex: 1, minHeight: 0 }}>
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
                height: '100%',
                minHeight: 0,
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
                  w={24}
                  h={24}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backgroundColor: isToday ? '#6366f1' : 'transparent',
                    color: isToday ? '#ffffff' : '#f3f4f6',
                    fontWeight: isToday ? 700 : 600,
                    fontSize: 12
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
                      0 itens
                    </Text>
                  )}
                </Box>
              </Stack>

              <Stack gap={6} mt="xs" style={{ flex: 1 }}>
                {items.length === 0 ? (
                  <Text size="xs" c="dimmed" ta="center" mt="md">
                    Sem itens
                  </Text>
                ) : (
                  items.map((item) => {
                    const isReadOnly = !!item.readOnly
                    const itemColor = item.calendarColor || '#6366f1'
                    const isItemToggling = togglingId === item.habitId
                    const isTask = item.category === 'task'
                    const isSchedule = item.category === 'schedule'
                    const baseBorder = isReadOnly
                      ? `${itemColor}44`
                      : isSchedule
                        ? 'rgba(245, 158, 11, 0.3)'
                        : isTask
                          ? 'rgba(6, 182, 212, 0.3)'
                          : 'rgba(99, 102, 241, 0.25)'
                    const baseBg = isReadOnly
                      ? `${itemColor}1f`
                      : isSchedule
                        ? 'rgba(245, 158, 11, 0.1)'
                        : isTask
                          ? 'rgba(6, 182, 212, 0.1)'
                          : 'rgba(99, 102, 241, 0.12)'

                    return (
                      <Box
                        key={item.habitId}
                        p={6}
                        title={`${item.title}${item.calendarName ? ` • ${item.calendarName}` : ''}${isReadOnly ? ' (Somente visualização)' : ''}`}
                        style={{
                          background: item.completed ? 'rgba(45, 212, 191, 0.12)' : baseBg,
                          border: item.completed ? '1px solid rgba(45, 212, 191, 0.3)' : `1px solid ${baseBorder}`,
                          borderRadius: 6,
                          transition: 'all 0.15s ease',
                          cursor: isReadOnly ? 'default' : 'pointer'
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!isReadOnly && onEditItem) {
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

                          {isReadOnly ? (
                            <Box
                              w={8}
                              h={8}
                              style={{
                                borderRadius: '50%',
                                backgroundColor: itemColor,
                                flexShrink: 0
                              }}
                            />
                          ) : (
                            <ActionIcon
                              size="xs"
                              variant="subtle"
                              color={item.completed ? 'teal' : 'gray'}
                              loading={isItemToggling}
                              onClick={(e) => {
                                e.stopPropagation()
                                onToggleCheckin(item.habitId, dateStr)
                              }}
                              aria-label="Concluir item"
                            >
                              {item.completed ? <TbCheck size={14} /> : <TbCircle size={14} />}
                            </ActionIcon>
                          )}
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
