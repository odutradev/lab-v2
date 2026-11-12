import { useMemo } from 'react'
import { Group, Text, Box, Tooltip, Badge, alpha } from '@mantine/core'
import { TbActivity, TbInfoCircle } from 'react-icons/tb'

import Card, { CardHeader, CardTitle, CardContent } from '@components/card'

import type { GeneralPerformanceCardProps } from './types'
import { colors } from '@styles/theme'

export const GeneralPerformanceCard = ({
  metrics,
  selectedDate,
  hoveredDate,
  onSelectDate,
  onHoverDate
}: GeneralPerformanceCardProps) => {
  const days = metrics?.days ?? []

  const stats = useMemo(() => {
    return {
      average: metrics?.averageOverallRate ?? 0,
      monthLabel: metrics?.monthLabel ?? 'Mês Atual',
      averageHabitRate: metrics?.averageHabitRate ?? 0,
      averageWaterRate: metrics?.averageWaterRate ?? 0,
      averageSleepRate: metrics?.averageSleepRate ?? 0
    }
  }, [metrics])

  const currentMonthKey = selectedDate?.slice(0, 7) || stats.monthLabel

  return (
    <Card style={{ position: 'relative', overflow: 'hidden' }}>
      <Box
        style={{
          position: 'absolute',
          top: -24,
          right: -24,
          width: 120,
          height: 120,
          background: `radial-gradient(circle, ${alpha(colors.purple500, 0.16)} 0%, transparent 70%)`,
          pointerEvents: 'none'
        }}
      />

      <CardHeader style={{ paddingBottom: 6, borderBottom: 'none' }}>
        <Group justify="space-between" align="center" wrap="wrap" gap="xs">
          <Group gap={6} align="center">
            <TbActivity size={18} color={colors.purple500} />
            <CardTitle style={{ fontSize: '14px', fontWeight: 700 }}>Desempenho Geral</CardTitle>
            <Tooltip
              label={
                metrics?.formulaExplanation ||
                'O índice diário pondera hábitos programados, água e sono. A contagem começa em 100% no dia e desconta o que não for cumprido. Se não houver hábitos programados na data, o valor desse pilar é considerado 100%.'
              }
              multiline
              w={280}
              withArrow
              position="bottom-start"
            >
              <Box style={{ display: 'inline-flex', cursor: 'pointer', opacity: 0.8, verticalAlign: 'middle' }}>
                <TbInfoCircle size={14} color={colors.slate400} />
              </Box>
            </Tooltip>
          </Group>

          <Group gap={8} align="center">
            <Tooltip
              label={`Média do mês:\n• Hábitos: ${stats.averageHabitRate}%\n• Água: ${stats.averageWaterRate}%\n• Sono: ${stats.averageSleepRate}%${
                metrics?.performanceWeights
                  ? `\n\nPesos configurados:\n• Hábitos: ${metrics.performanceWeights.habits}%\n• Água: ${metrics.performanceWeights.water}%\n• Sono: ${metrics.performanceWeights.sleep}%`
                  : ''
              }`}
              multiline
              withArrow
              position="bottom-end"
            >
              <Badge
                variant="gradient"
                gradient={
                  stats.average >= 80
                    ? { from: 'teal', to: 'emerald' }
                    : stats.average >= 50
                      ? { from: 'indigo', to: 'cyan' }
                      : { from: 'orange', to: 'red' }
                }
                size="sm"
                style={{ cursor: 'pointer' }}
              >
                {stats.average}% no mês
              </Badge>
            </Tooltip>
          </Group>
        </Group>
      </CardHeader>

      <CardContent style={{ paddingTop: 0 }}>
        <Box
          key={currentMonthKey}
          className="chart-fade-transition"
          mt="xs"
        >
          <Group justify="space-between" align="center" mb={6} wrap="wrap" gap="xs">
            <Text size="11px" c="dimmed" fw={600} style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Constância Diária ({stats.monthLabel})
            </Text>
            <Group gap={8} wrap="wrap">
              <Group gap={3} align="center">
                <Box w={6} h={6} style={{ borderRadius: '50%', background: colors.emerald500 }} />
                <Text size="10px" c="dimmed">100%</Text>
              </Group>
              <Group gap={3} align="center">
                <Box w={6} h={6} style={{ borderRadius: '50%', background: colors.indigo500 }} />
                <Text size="10px" c="dimmed">Parcial</Text>
              </Group>
              <Group gap={3} align="center">
                <Box w={6} h={6} style={{ borderRadius: '50%', background: alpha(colors.white, 0.1) }} />
                <Text size="10px" c="dimmed">0%</Text>
              </Group>
            </Group>
          </Group>

          <Box
            onMouseLeave={() => onHoverDate?.(null)}
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 3,
              height: 48,
              padding: '6px 8px',
              borderRadius: 8,
              background: alpha(colors.white, 0.02),
              border: `1px solid ${alpha(colors.white, 0.05)}`,
              overflow: 'hidden'
            }}
          >
            {days.map((item) => {
              const isSelected = item.date === selectedDate
              const isHovered = item.date === hoveredDate
              const barHeight = item.isFuture
                ? 4
                : item.overallRate === 0
                  ? 5
                  : Math.max(8, Math.round((item.overallRate / 100) * 36))

              const barColor = item.isFuture
                ? alpha(colors.white, 0.04)
                : item.overallRate >= 100
                  ? colors.emerald500
                  : item.overallRate >= 60
                    ? colors.indigo500
                    : item.overallRate > 0
                      ? colors.sky400
                      : alpha(colors.white, 0.12)

              const sleepInfo = item.sleepHours > 0
                ? `${item.sleepHours}h/${item.sleepGoalHours}h (${item.sleepRate}%)`
                : `Sem registro (0%)`

              const habitInfo = item.totalHabits > 0
                ? `${item.completedHabits}/${item.totalHabits} (${item.habitRate}%)`
                : `Sem itens (${item.habitRate}%)`

              const tooltipText = item.isFuture
                ? `Dia ${item.day}: Dia futuro`
                : `Dia ${item.day} (${item.dayOfWeek}): ${item.overallRate}% de constância\n• Hábitos: ${habitInfo}\n• Água: ${item.waterConsumedBottles}/${item.waterGoalBottles} garrafas (${item.waterRate}%)\n• Sono: ${sleepInfo}`

              return (
                <Tooltip
                  key={item.date}
                  label={tooltipText}
                  multiline
                  withArrow
                  position="top"
                >
                  <Box
                    onClick={() => onSelectDate?.(item.date)}
                    onMouseEnter={() => onHoverDate?.(item.date)}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      height: `${barHeight}px`,
                      background: barColor,
                      borderRadius: '3px 3px 2px 2px',
                      cursor: 'pointer',
                      position: 'relative',
                      opacity: item.isFuture ? 0.35 : 1,
                      border: isSelected
                        ? `1.5px solid ${colors.white}`
                        : isHovered
                          ? `1.5px solid ${colors.sky400}`
                          : item.isToday
                            ? `1.5px solid ${colors.purple400}`
                            : 'none',
                      boxShadow: isSelected
                        ? `0 0 8px ${alpha(colors.white, 0.5)}`
                        : isHovered
                          ? `0 0 8px ${alpha(colors.sky400, 0.6)}`
                          : item.overallRate >= 100
                            ? `0 0 6px ${alpha(colors.emerald500, 0.4)}`
                            : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  />
                </Tooltip>
              )
            })}
          </Box>

          {days.length > 0 && (
            <Group justify="space-between" align="center" px={4} mt={3}>
              <Text size="9px" c="dimmed">
                Dia 1
              </Text>
              <Text size="9px" c="dimmed">
                Dia 15
              </Text>
              <Text size="9px" c="dimmed">
                Dia {days.length}
              </Text>
            </Group>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default GeneralPerformanceCard
