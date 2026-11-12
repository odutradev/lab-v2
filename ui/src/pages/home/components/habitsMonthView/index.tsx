import { SimpleGrid, Text, Box } from '@mantine/core'

import { HabitsMonthCell } from './habitsMonthCell'
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
  const weeksCount = Math.max(1, Math.ceil(monthCells.length / 7))

  return (
    <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%', maxWidth: '100%' }}>
      <SimpleGrid cols={7} spacing={4} mb="xs" style={{ width: '100%', maxWidth: '100%' }}>
        {weekHeaders.map((header) => (
          <Box key={header} ta="center" py={4} style={{ minWidth: 0, overflow: 'hidden' }}>
            <Text fz={{ base: 10, sm: 12 }} fw={700} c="dimmed" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {header}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      <Box
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gridTemplateRows: `repeat(${weeksCount}, 1fr)`,
          gap: 4,
          minHeight: 0,
          width: '100%',
          maxWidth: '100%'
        }}
      >
        {monthCells.map((cell) => (
          <HabitsMonthCell
            key={cell.date}
            cell={cell}
            summary={rangeSummariesMap.get(cell.date)}
            isSelected={cell.date === selectedDate}
            onSelectDate={onSelectDate}
            onToggleCheckin={onToggleCheckin}
            onEditItem={onEditItem}
          />
        ))}
      </Box>
    </Box>
  )
}

export default HabitsMonthView
