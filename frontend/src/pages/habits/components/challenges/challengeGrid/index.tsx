import { Box, Group, Tooltip, Text } from '@mantine/core'
import { addDaysToDateString, formatDisplayDate, getTodayDateString } from '@stores/challenges/utils'

interface ChallengeGridProps {
  startDate: string
  targetDays: number
  checkins: string[]
  slipDates?: string[]
  onToggleDate?: (date: string) => void
}

export const ChallengeGrid = ({
  startDate,
  targetDays,
  checkins,
  slipDates = [],
  onToggleDate
}: ChallengeGridProps) => {
  const todayStr = getTodayDateString()
  const checkinSet = new Set(checkins)
  const slipSet = new Set(slipDates)

  const daysArray = Array.from({ length: targetDays }, (_, idx) => {
    const dayNumber = idx + 1
    const dateStr = addDaysToDateString(startDate, idx)
    const isCompleted = checkinSet.has(dateStr)
    const isSlip = slipSet.has(dateStr)
    const isToday = dateStr === todayStr
    const isPast = dateStr < todayStr
    const isFuture = dateStr > todayStr

    let statusLabel = 'Pendente'
    let bgColor = 'rgba(255, 255, 255, 0.05)'
    let borderColor = 'rgba(255, 255, 255, 0.1)'
    let boxShadow = 'none'

    if (isCompleted) {
      statusLabel = 'Concluído ✓'
      bgColor = '#10b981'
      borderColor = '#34d399'
      boxShadow = '0 0 8px rgba(16, 185, 129, 0.4)'
    } else if (isSlip) {
      statusLabel = 'Deslize registrado'
      bgColor = '#f59e0b'
      borderColor = '#fbbf24'
    } else if (isToday) {
      statusLabel = 'Hoje (Aguardando)'
      bgColor = 'rgba(99, 102, 241, 0.2)'
      borderColor = '#818cf8'
    } else if (isPast) {
      statusLabel = 'Não preenchido'
      bgColor = 'rgba(239, 68, 68, 0.12)'
      borderColor = 'rgba(239, 68, 68, 0.3)'
    } else if (isFuture) {
      statusLabel = 'Futuro'
      bgColor = 'rgba(255, 255, 255, 0.03)'
      borderColor = 'rgba(255, 255, 255, 0.06)'
    }

    return {
      dayNumber,
      dateStr,
      isCompleted,
      isSlip,
      isToday,
      isPast,
      isFuture,
      statusLabel,
      bgColor,
      borderColor,
      boxShadow
    }
  })

  return (
    <Box>
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(20px, 1fr))',
          gap: 6,
          padding: '12px',
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.06)',
          maxHeight: 240,
          overflowY: 'auto'
        }}
      >
        {daysArray.map((day) => (
          <Tooltip
            key={day.dayNumber}
            label={`Dia ${day.dayNumber} • ${formatDisplayDate(day.dateStr)}: ${day.statusLabel}`}
            withArrow
            position="top"
          >
            <Box
              onClick={() => onToggleDate && onToggleDate(day.dateStr)}
              style={{
                aspectRatio: '1 / 1',
                borderRadius: 4,
                backgroundColor: day.bgColor,
                border: `1px solid ${day.borderColor}`,
                boxShadow: day.boxShadow,
                cursor: onToggleDate ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />
          </Tooltip>
        ))}
      </Box>

      {/* Legenda */}
      <Group gap="md" mt="xs" justify="center" wrap="wrap">
        <Group gap={6}>
          <Box w={12} h={12} style={{ borderRadius: 3, backgroundColor: '#10b981' }} />
          <Text size="xs" c="dimmed">Concluído</Text>
        </Group>
        <Group gap={6}>
          <Box w={12} h={12} style={{ borderRadius: 3, backgroundColor: 'rgba(99, 102, 241, 0.2)', border: '1px solid #818cf8' }} />
          <Text size="xs" c="dimmed">Hoje</Text>
        </Group>
        <Group gap={6}>
          <Box w={12} h={12} style={{ borderRadius: 3, backgroundColor: '#f59e0b' }} />
          <Text size="xs" c="dimmed">Deslize</Text>
        </Group>
        <Group gap={6}>
          <Box w={12} h={12} style={{ borderRadius: 3, backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px dashed rgba(255, 255, 255, 0.15)' }} />
          <Text size="xs" c="dimmed">Futuro</Text>
        </Group>
      </Group>
    </Box>
  )
}

export default ChallengeGrid
