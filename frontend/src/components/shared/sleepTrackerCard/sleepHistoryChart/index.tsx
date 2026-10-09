import { useMemo } from 'react'
import { Box, Text, Group, Tooltip } from '@mantine/core'
import {
  getTodayDateString,
  getSleepQualityOption
} from '@stores/health/utils'
import type { SleepHistoryChartProps } from './types'

function createSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
  }

  let d = `M ${points[0].x} ${points[0].y}`

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1]

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6

    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }

  return d
}

export const SleepHistoryChart = ({
  records,
  selectedYear,
  selectedMonth,
  targetDate,
  hoveredDate,
  onOpenCheckinModal,
  onHoverDate
}: SleepHistoryChartProps) => {
  const todayStr = getTodayDateString()
  const activeTargetDate = targetDate || todayStr

  const {
    daysInMonth,
    activePoints,
    minHours,
    maxHours,
    avgHours,
    mostFrequentQuality,
    width,
    height,
    sleepPathD,
    sleepAreaD,
    targetZoneY1,
    targetZoneY2
  } = useMemo(() => {
    const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate()
    const monthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`

    const filtered = records
      .filter((r) => r.date.startsWith(monthPrefix))
      .sort((a, b) => a.date.localeCompare(b.date))

    const recordedDays = filtered.map((r) => {
      const dayNum = parseInt(r.date.split('-')[2], 10)
      return {
        date: r.date,
        day: dayNum,
        hours: r.hours,
        quality: r.quality,
        isToday: r.date === todayStr,
        isTarget: r.date === activeTargetDate
      }
    })

    const hoursList = recordedDays.map((d) => d.hours)
    const minH = hoursList.length > 0 ? Math.min(...hoursList) : 6
    const maxH = hoursList.length > 0 ? Math.max(...hoursList) : 9
    const sumH = hoursList.reduce((acc, h) => acc + h, 0)
    const avgH = hoursList.length > 0 ? sumH / hoursList.length : 0

    const qualityCounts: Record<number, number> = {}
    recordedDays.forEach((d) => {
      qualityCounts[d.quality] = (qualityCounts[d.quality] || 0) + 1
    })
    let topQuality = 4
    let topCount = 0
    Object.entries(qualityCounts).forEach(([q, c]) => {
      if (c > topCount) {
        topCount = c
        topQuality = Number(q)
      }
    })

    const chartMinH = Math.min(4, Math.floor(minH - 1))
    const chartMaxH = Math.max(11, Math.ceil(maxH + 1))
    const rangeH = chartMaxH - chartMinH || 1

    const w = 520
    const h = 48
    const pX = 14
    const pTop = 6
    const pBottom = 6
    const innerW = w - pX * 2
    const innerH = h - pTop - pBottom

    const getYForHours = (val: number) => {
      return pTop + innerH - ((val - chartMinH) / rangeH) * innerH
    }

    const tZoneY1 = Math.round(getYForHours(9) * 10) / 10
    const tZoneY2 = Math.round(getYForHours(7) * 10) / 10

    const pointsWithCoords = recordedDays.map((d) => {
      const x = pX + ((d.day - 1) / (totalDays - 1)) * innerW
      const y = getYForHours(d.hours)

      return {
        ...d,
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10
      }
    })

    const coordPoints = pointsWithCoords.map((p) => ({ x: p.x, y: p.y }))
    const pDSleep = createSmoothPath(coordPoints)
    const aDSleep =
      coordPoints.length > 1
        ? `${pDSleep} L ${coordPoints[coordPoints.length - 1].x} ${h - pBottom} L ${coordPoints[0].x} ${h - pBottom} Z`
        : ''

    return {
      daysInMonth: totalDays,
      activePoints: pointsWithCoords,
      minHours: minH,
      maxHours: maxH,
      avgHours: avgH,
      mostFrequentQuality: topQuality,
      width: w,
      height: h,
      sleepPathD: pDSleep,
      sleepAreaD: aDSleep,
      targetZoneY1: tZoneY1,
      targetZoneY2: tZoneY2
    }
  }, [records, selectedYear, selectedMonth, todayStr, activeTargetDate])

  const hoveredX = useMemo(() => {
    if (!hoveredDate) return null
    const monthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`
    if (!hoveredDate.startsWith(monthPrefix)) return null
    const dayNum = parseInt(hoveredDate.split('-')[2], 10)
    if (isNaN(dayNum) || dayNum < 1 || dayNum > daysInMonth) return null
    return Math.round((14 + ((dayNum - 1) / (daysInMonth - 1)) * (width - 28)) * 10) / 10
  }, [hoveredDate, selectedYear, selectedMonth, daysInMonth, width])

  const hasData = activePoints.length > 0
  const topQualityOpt = getSleepQualityOption(mostFrequentQuality)

  return (
    <Box
      key={`${selectedYear}-${selectedMonth}`}
      className="chart-fade-transition"
    >
      <Group justify="space-between" align="center" mb={6} wrap="wrap" gap="xs">
        <Group gap={8} align="center" wrap="wrap">
          <Group gap={4} align="center">
            <Box
              w={6}
              h={6}
              style={{
                borderRadius: '50%',
                backgroundColor: '#c084fc'
              }}
            />
            <Text size="10px" c="dimmed">
              Horas de Sono
            </Text>
          </Group>

          <Group gap={4} align="center">
            <Box
              w={10}
              h={5}
              style={{
                borderRadius: 2,
                backgroundColor: 'rgba(74, 222, 128, 0.35)',
                border: '1px dashed #4ade80'
              }}
            />
            <Text size="10px" c="dimmed">
              Meta (7h - 9h)
            </Text>
          </Group>
        </Group>

        {hasData ? (
          <Group gap={6} align="center">
            <Text size="10px" c="dimmed">
              Mín <span style={{ color: '#818cf8', fontWeight: 600 }}>{minHours.toFixed(1)}h</span>
            </Text>
            <Text size="10px" c="dimmed">•</Text>
            <Text size="10px" c="dimmed">
              Máx <span style={{ color: '#e879f9', fontWeight: 600 }}>{maxHours.toFixed(1)}h</span>
            </Text>
            <Text size="10px" c="dimmed">•</Text>
            <Text size="10px" c="dimmed">
              Média <span style={{ color: '#c084fc', fontWeight: 700 }}>{avgHours.toFixed(1)}h</span>
            </Text>
            <Text size="10px" c="dimmed">
              {topQualityOpt.emoji}
            </Text>
          </Group>
        ) : (
          <Text size="10px" c="dimmed">Sem registros</Text>
        )}
      </Group>

      <Box
        style={{
          height: 48,
          borderRadius: 8,
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: '100%', display: 'block' }}
          onMouseLeave={() => onHoverDate?.(null)}
        >
          <defs>
            <linearGradient id="sleepAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="sleepLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#e879f9" />
            </linearGradient>
          </defs>

          {hoveredX !== null && (
            <line
              x1={hoveredX}
              y1={0}
              x2={hoveredX}
              y2={height}
              stroke="rgba(192, 132, 252, 0.45)"
              strokeDasharray="2 2"
              strokeWidth="1.2"
              pointerEvents="none"
            />
          )}

          {/* Faixa ideal da meta (7h - 9h) */}
          <rect
            x={14}
            y={targetZoneY1}
            width={width - 28}
            height={Math.max(2, targetZoneY2 - targetZoneY1)}
            fill="rgba(74, 222, 128, 0.07)"
          />
          <line
            x1={14}
            y1={targetZoneY1}
            x2={width - 14}
            y2={targetZoneY1}
            stroke="rgba(74, 222, 128, 0.3)"
            strokeDasharray="2 3"
          />
          <line
            x1={14}
            y1={targetZoneY2}
            x2={width - 14}
            y2={targetZoneY2}
            stroke="rgba(74, 222, 128, 0.3)"
            strokeDasharray="2 3"
          />

          {sleepAreaD && <path d={sleepAreaD} fill="url(#sleepAreaGrad)" />}
          {sleepPathD && (
            <path
              d={sleepPathD}
              fill="none"
              stroke="url(#sleepLineGrad)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {activePoints.map((point) => {
            const isHighlighted = point.isTarget || (point.isToday && !targetDate) || point.date === hoveredDate
            const qualityOpt = getSleepQualityOption(point.quality)

            return (
              <Tooltip
                key={point.date}
                label={`Dia ${point.day}: ${point.hours.toFixed(1)}h dormidas • ${qualityOpt.emoji} ${qualityOpt.label}`}
                withArrow
                position="top"
              >
                <g
                  style={{ cursor: 'pointer' }}
                  onClick={() => onOpenCheckinModal(point.date)}
                  onMouseEnter={() => onHoverDate?.(point.date)}
                  onMouseLeave={() => onHoverDate?.(null)}
                >
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isHighlighted ? 4.4 : 2.5}
                    fill={isHighlighted ? '#c084fc' : qualityOpt.color}
                    stroke={isHighlighted ? '#ffffff' : '#0f172a'}
                    strokeWidth={isHighlighted ? 1.6 : 1.2}
                  />
                </g>
              </Tooltip>
            )
          })}

          {!hasData && (
            <text
              x={width / 2}
              y={28}
              textAnchor="middle"
              fill="rgba(255, 255, 255, 0.3)"
              fontSize="10"
            >
              Sem check-ins de sono neste mês
            </text>
          )}
        </svg>
      </Box>

      <Group justify="space-between" align="center" px={4} mt={3}>
        <Text size="9px" c="dimmed">
          Dia 1
        </Text>
        <Text size="9px" c="dimmed">
          Dia 15
        </Text>
        <Text size="9px" c="dimmed">
          Dia {daysInMonth}
        </Text>
      </Group>
    </Box>
  )
}

export default SleepHistoryChart
