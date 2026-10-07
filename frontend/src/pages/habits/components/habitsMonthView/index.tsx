import { SimpleGrid, Stack, Group, Text, Box } from '@mantine/core'
import { TbCheck, TbCircle } from 'react-icons/tb'

import Badge from '@components/ui/badge'

import type { HabitsMonthViewProps } from './types'

const weekHeaders = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

export const HabitsMonthView = ({
  monthCells,
  rangeSummariesMap,
  selectedDate,
  onSelectDate,
  onToggleCheckin,
  onEditItem
}: HabitsMonthViewProps) => {
  return (
    <Box>
      <SimpleGrid cols={7} spacing={4} mb="xs">
        {weekHeaders.map((header) => (
          <Box key={header} ta="center" py={4}>
            <Text size="xs" fw={700} c="dimmed">
              {header}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={7} spacing={4}>
        {monthCells.map((cell) => {
          const summary = rangeSummariesMap.get(cell.date)
          const items = summary?.items ?? []
          const completionRate = summary?.completionRate ?? 0
          const totalHabits = summary?.totalHabits ?? 0
          const isSelected = cell.date === selectedDate

          const visibleItems = items.slice(0, 3)
          const remainingCount = items.length - 3

          return (
            <Box
              key={cell.date}
              p={6}
              style={{
                minHeight: 110,
                background: isSelected
                  ? 'rgba(99, 102, 241, 0.14)'
                  : cell.isToday
                    ? 'rgba(99, 102, 241, 0.06)'
                    : cell.isCurrentMonth
                      ? 'rgba(255, 255, 255, 0.02)'
                      : 'rgba(0, 0, 0, 0.25)',
                border: isSelected
                  ? '1px solid rgba(129, 140, 248, 0.6)'
                  : cell.isToday
                    ? '1px solid rgba(129, 140, 248, 0.35)'
                    : '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: 8,
                opacity: cell.isCurrentMonth ? 1 : 0.45,
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease'
              }}
              onClick={() => onSelectDate(cell.date)}
            >
              <Group justify="space-between" align="center" mb={4}>
                <Box
                  w={28}
                  h={28}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backgroundColor: cell.isToday ? '#6366f1' : 'transparent',
                    boxShadow: cell.isToday
                      ? '0 0 0 2px rgba(129, 140, 248, 0.6), 0 2px 8px rgba(99, 102, 241, 0.45)'
                      : 'none',
                    color: cell.isToday ? '#ffffff' : cell.isCurrentMonth ? '#f3f4f6' : '#9ca3af',
                    fontWeight: cell.isToday ? 800 : 600,
                    fontSize: 12
                  }}
                >
                  {cell.dayNumber}
                </Box>

                {totalHabits > 0 && (
                  <Badge variant={completionRate === 100 ? 'success' : completionRate >= 80 ? 'primary' : 'warning'}>
                    {completionRate}%
                  </Badge>
                )}
              </Group>

              <Stack gap={2} style={{ flex: 1, overflow: 'hidden' }}>
                {visibleItems.map((item) => (
                  <Box
                    key={item.habitId}
                    px={4}
                    py={2}
                    title={`${item.title}${item.startTime ? ` (${item.startTime}${item.endTime ? ` - ${item.endTime}` : ''})` : ''}`}
                    style={{
                      background: item.completed ? 'rgba(45, 212, 191, 0.14)' : 'rgba(99, 102, 241, 0.14)',
                      borderRadius: 4,
                      border: item.completed ? '1px solid rgba(45, 212, 191, 0.25)' : '1px solid rgba(99, 102, 241, 0.2)',
                      fontSize: 10,
                      lineHeight: 1.2
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (onEditItem) {
                        onEditItem(item.habitId, cell.date)
                      }
                    }}
                  >
                    <Group gap={4} wrap="nowrap" align="center">
                      <Box
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleCheckin(item.habitId, cell.date)
                        }}
                        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                      >
                        {item.completed ? (
                          <TbCheck size={11} color="#2dd4bf" style={{ flexShrink: 0 }} />
                        ) : (
                          <TbCircle size={11} color="#818cf8" style={{ flexShrink: 0 }} />
                        )}
                      </Box>
                      {item.startTime && (
                        <Text
                          size="9px"
                          fw={700}
                          c={item.completed ? 'dimmed' : '#93c5fd'}
                          style={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
                        >
                          {item.startTime}
                        </Text>
                      )}
                      <Text
                        size="10px"
                        fw={500}
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
                    </Group>
                  </Box>
                ))}

                {remainingCount > 0 && (
                  <Text size="10px" c="dimmed" fw={600} pl={4}>
                    +{remainingCount} mais
                  </Text>
                )}
              </Stack>
            </Box>
          )
        })}
      </SimpleGrid>
    </Box>
  )
}

export default HabitsMonthView
