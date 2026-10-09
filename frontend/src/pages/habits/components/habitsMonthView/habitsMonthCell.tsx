import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Group, Stack, Text, Box } from '@mantine/core'
import { TbCheck, TbCircle } from 'react-icons/tb'

import Badge from '@components/ui/badge'

import type { DaySummaryItem } from '@actions/habits/types'
import type { HabitsMonthCellProps } from './types'

const ITEM_GAP = 2
const DEFAULT_ITEM_HEIGHT = 22
const MORE_INDICATOR_HEIGHT = 16
const EMPTY_ITEMS: DaySummaryItem[] = []

export const HabitsMonthCell = ({
  cell,
  summary,
  isSelected,
  onSelectDate,
  onToggleCheckin,
  onEditItem
}: HabitsMonthCellProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const items = summary?.items ?? EMPTY_ITEMS
  const totalHabits = summary?.totalHabits ?? 0
  const completionRate = summary?.completionRate ?? 0

  const [availableHeight, setAvailableHeight] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return Math.max(50, Math.floor((window.innerHeight - 320) / 6))
    }
    return 80
  })

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height
        if (height > 0) {
          setAvailableHeight((prev) => (Math.abs(prev - height) > 2 ? height : prev))
        }
      }
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const { visibleItems, remainingCount } = useMemo(() => {
    if (items.length === 0) {
      return { visibleItems: [], remainingCount: 0 }
    }

    const itemHeight = typeof window !== 'undefined' && window.innerWidth < 768 ? 20 : DEFAULT_ITEM_HEIGHT

    // Altura necessária se renderizarmos todos os itens sem o indicador
    const heightNeededForAll = items.length * itemHeight + (items.length - 1) * ITEM_GAP

    // Se cabem todos os itens no espaço disponível, exibe todos sem o chip
    if (heightNeededForAll <= availableHeight) {
      return { visibleItems: items, remainingCount: 0 }
    }

    // Se não cabem todos, reserva espaço para o indicador "+X mais"
    const availableForItems = availableHeight - MORE_INDICATOR_HEIGHT - ITEM_GAP
    const maxItems = Math.floor((availableForItems + ITEM_GAP) / (itemHeight + ITEM_GAP))
    const count = Math.max(1, Math.min(items.length - 1, maxItems))

    return {
      visibleItems: items.slice(0, count),
      remainingCount: items.length - count
    }
  }, [items, availableHeight])

  return (
    <Box
      p={{ base: '3px', sm: '5px' }}
      style={{
        height: '100%',
        minHeight: 0,
        minWidth: 0,
        maxWidth: '100%',
        overflow: 'hidden',
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
      <Group justify="space-between" align="center" mb={{ base: '2px', sm: '4px' }} gap={2} wrap="nowrap" style={{ minWidth: 0, width: '100%' }}>
        <Box
          w={{ base: 18, sm: 22 }}
          h={{ base: 18, sm: 22 }}
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: cell.isToday ? '#6366f1' : 'transparent',
            color: cell.isToday ? '#ffffff' : cell.isCurrentMonth ? '#f3f4f6' : '#9ca3af',
            fontWeight: cell.isToday ? 700 : 600,
            fontSize: 10
          }}
        >
          {cell.dayNumber}
        </Box>

        {totalHabits > 0 && (
          <Badge
            variant={completionRate === 100 ? 'success' : completionRate >= 80 ? 'primary' : 'warning'}
            size="xs"
            style={{
              flexShrink: 0,
              padding: '0 3px',
              height: 15,
              fontSize: 9,
              lineHeight: '15px',
              fontWeight: 700
            }}
          >
            {completionRate}%
          </Badge>
        )}
      </Group>

      <Stack ref={containerRef} gap={ITEM_GAP} style={{ flex: 1, overflow: 'hidden', minWidth: 0, width: '100%' }}>
        {visibleItems.map((item) => (
          <Box
            key={item.habitId}
            px={{ base: '2px', sm: '4px' }}
            py={{ base: '2px', sm: '3px' }}
            title={`${item.title}${item.startTime ? ` (${item.startTime}${item.endTime ? ` - ${item.endTime}` : ''})` : ''}`}
            style={{
              background: item.completed ? 'rgba(45, 212, 191, 0.14)' : 'rgba(99, 102, 241, 0.14)',
              borderRadius: 4,
              border: item.completed ? '1px solid rgba(45, 212, 191, 0.25)' : '1px solid rgba(99, 102, 241, 0.2)',
              fontSize: 10,
              lineHeight: 1.2,
              minWidth: 0,
              maxWidth: '100%',
              overflow: 'hidden',
              flexShrink: 0
            }}
            onClick={(e) => {
              e.stopPropagation()
              if (onEditItem) {
                onEditItem(item.habitId, cell.date)
              }
            }}
          >
            <Group gap={3} wrap="nowrap" align="center" style={{ minWidth: 0, width: '100%', overflow: 'hidden' }}>
              <Box
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleCheckin(item.habitId, cell.date)
                }}
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}
              >
                {item.completed ? (
                  <TbCheck size={11} color="#2dd4bf" style={{ flexShrink: 0 }} />
                ) : (
                  <TbCircle size={11} color="#818cf8" style={{ flexShrink: 0 }} />
                )}
              </Box>
              {item.startTime && (
                <Box visibleFrom="sm" style={{ flexShrink: 0 }}>
                  <Text
                    size="9px"
                    fw={700}
                    c={item.completed ? 'dimmed' : '#93c5fd'}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {item.startTime}
                  </Text>
                </Box>
              )}
              <Text
                size="10px"
                fw={500}
                c={item.completed ? 'dimmed' : 'white'}
                style={{
                  flex: 1,
                  minWidth: 0,
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
          <Text
            size="9px"
            c="dimmed"
            fw={600}
            pl={{ base: '2px', sm: '4px' }}
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.2,
              flexShrink: 0
            }}
          >
            +{remainingCount} mais
          </Text>
        )}
      </Stack>
    </Box>
  )
}

export default HabitsMonthCell
