import { useMemo } from 'react'
import { Group, Text, Box, Tooltip, Badge } from '@mantine/core'
import { TbActivity, TbInfoCircle } from 'react-icons/tb'

import Card, { CardHeader, CardTitle, CardContent } from '@components/ui/card'
import type { MonthlyMetricsResponse } from '@actions/habits/types'

interface GeneralPerformanceCardProps {
  metrics: MonthlyMetricsResponse | null
  isLoading?: boolean
  selectedDate?: string
  onSelectDate?: (date: string) => void
}

export const GeneralPerformanceCard = ({
  metrics,
  selectedDate,
  onSelectDate
}: GeneralPerformanceCardProps) => {
  const days = metrics?.days ?? []

  const stats = useMemo(() => {
    return {
      average: metrics?.averageOverallRate ?? 0,
      monthLabel: metrics?.monthLabel ?? 'Mês Atual'
    }
  }, [metrics])

  return (
    <Card style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Glow suave no topo */}
      <Box
        style={{
          position: 'absolute',
          top: -24,
          right: -24,
          width: 120,
          height: 120,
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.16) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <CardHeader style={{ paddingBottom: 6 }}>
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap={6} align="center">
            <TbActivity size={18} color="#a855f7" />
            <CardTitle style={{ fontSize: '14px', fontWeight: 700 }}>Desempenho Geral</CardTitle>
            <Tooltip
              label={
                metrics?.formulaExplanation ||
                'O índice diário considera seus hábitos programados + a meta diária de hidratação. Cada hábito equivale a 1 meta e a água a 1 meta de saúde. Se você tiver 3 hábitos e bater a meta de água, são 4 metas de 25% cada (totalizando 100%).'
              }
              multiline
              w={260}
              withArrow
              position="bottom-start"
            >
              <Box style={{ display: 'inline-flex', cursor: 'pointer', opacity: 0.8, verticalAlign: 'middle' }}>
                <TbInfoCircle size={14} color="#94a3b8" />
              </Box>
            </Tooltip>
          </Group>

          <Group gap={8} align="center">
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
            >
              {stats.average}% no mês
            </Badge>
          </Group>
        </Group>
      </CardHeader>

      <CardContent style={{ paddingTop: 0 }}>
        {/* Gráfico dia a dia do mês */}
        <Box mt="xs">
          <Group justify="space-between" align="center" mb={6}>
            <Text size="11px" c="dimmed" fw={600} style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Constância Diária ({stats.monthLabel})
            </Text>
            <Group gap={8}>
              <Group gap={3} align="center">
                <Box w={6} h={6} style={{ borderRadius: '50%', background: '#10b981' }} />
                <Text size="10px" c="dimmed">100%</Text>
              </Group>
              <Group gap={3} align="center">
                <Box w={6} h={6} style={{ borderRadius: '50%', background: '#6366f1' }} />
                <Text size="10px" c="dimmed">Parcial</Text>
              </Group>
              <Group gap={3} align="center">
                <Box w={6} h={6} style={{ borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                <Text size="10px" c="dimmed">0%</Text>
              </Group>
            </Group>
          </Group>

          {/* Barras do Gráfico com Tooltip por dia (ocupando toda a largura sem scroll) */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 3,
              height: 48,
              padding: '6px 8px',
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              overflow: 'hidden'
            }}
          >
            {days.map((item) => {
              const isSelected = item.date === selectedDate
              const barHeight = item.isFuture
                ? 4
                : item.overallRate === 0
                  ? 5
                  : Math.max(8, Math.round((item.overallRate / 100) * 36))

              const barColor = item.isFuture
                ? 'rgba(255, 255, 255, 0.04)'
                : item.overallRate >= 100
                  ? '#10b981'
                  : item.overallRate >= 60
                    ? '#6366f1'
                    : item.overallRate > 0
                      ? '#38bdf8'
                      : 'rgba(255, 255, 255, 0.12)'

              const tooltipText = item.isFuture
                ? `Dia ${item.day}: Dia futuro`
                : `Dia ${item.day} (${item.dayOfWeek}): ${item.overallRate}% de constância\n• Hábitos: ${item.completedHabits}/${item.totalHabits} (${item.habitRate}%)\n• Água: ${item.waterConsumedBottles}/${item.waterGoalBottles} garrafas (${item.waterRate}%)`

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
                        ? '1.5px solid #ffffff'
                        : item.isToday
                          ? '1.5px solid #c084fc'
                          : 'none',
                      boxShadow: isSelected
                        ? '0 0 8px rgba(255, 255, 255, 0.5)'
                        : item.overallRate >= 100
                          ? '0 0 6px rgba(16, 185, 129, 0.4)'
                          : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  />
                </Tooltip>
              )
            })}
          </Box>

          {/* Marcadores de Guia dos Dias */}
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
