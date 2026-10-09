import { useMemo, useState } from 'react'
import { Box, Text, Group } from '@mantine/core'
import {
  getTodayDateString,
  getSleepQualityOption,
  getSleepStatus
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
  onOpenCheckinModal
}: SleepHistoryChartProps) => {
  const todayStr = getTodayDateString()
  const activeTargetDate = targetDate || todayStr

  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string
    day: number
    hours: number
    quality: number
    x: number
    y: number
  } | null>(null)

  const {
    activePoints,
    minHours,
    maxHours,
    avgHours,
    mostFrequentQuality,
    width,
    height,
    paddingX,
    paddingTop,
    paddingBottom,
    sleepPathD,
    sleepAreaD,
    targetZoneY1,
    targetZoneY2,
    axisTicks,
    yTicks
  } = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
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
    const h = 200
    const pX = 36
    const pTop = 26
    const pBottom = 28
    const innerW = w - pX * 2
    const innerH = h - pTop - pBottom

    const getYForHours = (val: number) => {
      return pTop + innerH - ((val - chartMinH) / rangeH) * innerH
    }

    const tZoneY1 = Math.round(getYForHours(9) * 10) / 10
    const tZoneY2 = Math.round(getYForHours(7) * 10) / 10

    const pointsWithCoords = recordedDays.map((d) => {
      const x = pX + ((d.day - 1) / (daysInMonth - 1)) * innerW
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

    const ticks: { day: number; x: number }[] = []
    const step = 5
    for (let day = 1; day <= daysInMonth; day += step) {
      const x = pX + ((day - 1) / (daysInMonth - 1)) * innerW
      ticks.push({ day, x: Math.round(x * 10) / 10 })
    }
    if (ticks[ticks.length - 1].day !== daysInMonth) {
      ticks.push({ day: daysInMonth, x: pX + innerW })
    }

    const yTickValues = [4, 7, 9, 11]
    const calculatedYTicks = yTickValues.map((val) => ({
      val,
      y: Math.round(getYForHours(val) * 10) / 10
    }))

    return {
      activePoints: pointsWithCoords,
      minHours: minH,
      maxHours: maxH,
      avgHours: avgH,
      mostFrequentQuality: topQuality,
      width: w,
      height: h,
      paddingX: pX,
      paddingTop: pTop,
      paddingBottom: pBottom,
      sleepPathD: pDSleep,
      sleepAreaD: aDSleep,
      targetZoneY1: tZoneY1,
      targetZoneY2: tZoneY2,
      axisTicks: ticks,
      yTicks: calculatedYTicks
    }
  }, [records, selectedYear, selectedMonth, todayStr, activeTargetDate])

  const hasData = activePoints.length > 0
  const topQualityOpt = getSleepQualityOption(mostFrequentQuality)

  return (
    <Box>
      <Group justify="space-between" align="center" mb={10} wrap="wrap" gap="xs">
        <Group gap="sm" align="center" wrap="wrap">
          <Group gap={6} align="center">
            <Box
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#c084fc'
              }}
            />
            <Text size="11px" fw={600} c="#c084fc">
              Horas de Sono
            </Text>
          </Group>

          <Group gap={6} align="center">
            <Box
              style={{
                width: 14,
                height: 6,
                borderRadius: 2,
                backgroundColor: 'rgba(74, 222, 128, 0.35)',
                border: '1px dashed #4ade80'
              }}
            />
            <Text size="11px" fw={500} c="dimmed">
              Meta (7h - 9h)
            </Text>
          </Group>
        </Group>

        {hasData && (
          <Group gap="xs" align="center">
            <Text size="11px" c="dimmed">
              Mín{' '}
              <span style={{ color: '#818cf8', fontWeight: 600 }}>
                {minHours.toFixed(1)}h
              </span>
            </Text>
            <Text size="11px" c="dimmed">
              • Máx{' '}
              <span style={{ color: '#e879f9', fontWeight: 600 }}>
                {maxHours.toFixed(1)}h
              </span>
            </Text>
            <Text size="11px" c="dimmed">
              • Média{' '}
              <span style={{ color: '#c084fc', fontWeight: 700 }}>
                {avgHours.toFixed(1)}h
              </span>
            </Text>
            <Text size="11px" c="dimmed">
              • Predomínio:{' '}
              <span style={{ color: topQualityOpt.color, fontWeight: 700 }}>
                {topQualityOpt.emoji}
              </span>
            </Text>
          </Group>
        )}
      </Group>

      <Box
        style={{
          borderRadius: 12,
          background: 'rgba(255, 255, 255, 0.015)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '8px 2px 2px 2px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="sleepAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="sleepLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#e879f9" />
            </linearGradient>

            <filter id="sleepGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="3"
                floodColor="#c084fc"
                floodOpacity="0.8"
              />
            </filter>
          </defs>

          <rect
            x={paddingX}
            y={targetZoneY1}
            width={width - paddingX * 2}
            height={Math.max(2, targetZoneY2 - targetZoneY1)}
            fill="rgba(74, 222, 128, 0.06)"
          />
          <line
            x1={paddingX}
            y1={targetZoneY1}
            x2={width - paddingX}
            y2={targetZoneY1}
            stroke="rgba(74, 222, 128, 0.35)"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={targetZoneY2}
            x2={width - paddingX}
            y2={targetZoneY2}
            stroke="rgba(74, 222, 128, 0.35)"
            strokeDasharray="3 3"
          />

          <line
            x1={paddingX}
            y1={height - paddingBottom}
            x2={width - paddingX}
            y2={height - paddingBottom}
            stroke="rgba(255, 255, 255, 0.06)"
          />

          {yTicks.map((t) => (
            <text
              key={t.val}
              x={paddingX - 8}
              y={t.y + 3}
              textAnchor="end"
              fill={t.val === 7 || t.val === 9 ? '#4ade80' : 'rgba(255, 255, 255, 0.35)'}
              fontSize="9"
              fontWeight={t.val === 7 || t.val === 9 ? '700' : '500'}
              fontFamily="sans-serif"
            >
              {t.val}h
            </text>
          ))}

          {axisTicks.map((tick) => (
            <g key={tick.day}>
              <line
                x1={tick.x}
                y1={paddingTop}
                x2={tick.x}
                y2={height - paddingBottom}
                stroke="rgba(255, 255, 255, 0.03)"
              />
              <text
                x={tick.x}
                y={height - paddingBottom + 14}
                textAnchor="middle"
                fill="rgba(255, 255, 255, 0.35)"
                fontSize="9"
                fontFamily="sans-serif"
              >
                {tick.day}
              </text>
            </g>
          ))}

          {sleepAreaD && <path d={sleepAreaD} fill="url(#sleepAreaGrad)" />}
          {sleepPathD && (
            <path
              d={sleepPathD}
              fill="none"
              stroke="url(#sleepLineGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {activePoints.map((point) => {
            const isHovered = hoveredPoint?.date === point.date
            const qualityOpt = getSleepQualityOption(point.quality)

            return (
              <g
                key={point.date}
                style={{ cursor: 'pointer' }}
                onClick={() => onOpenCheckinModal(point.date)}
                onMouseEnter={() => setHoveredPoint(point)}
              >
                {isHovered && (
                  <line
                    x1={point.x}
                    y1={paddingTop}
                    x2={point.x}
                    y2={height - paddingBottom}
                    stroke="rgba(192, 132, 252, 0.45)"
                    strokeDasharray="2 2"
                  />
                )}

                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isHovered ? 7 : point.isTarget ? 5.5 : 4}
                  fill={qualityOpt.color}
                  stroke="#0f172a"
                  strokeWidth="2"
                  filter={isHovered ? 'url(#sleepGlow)' : undefined}
                />

                <text
                  x={point.x}
                  y={point.y - 8}
                  textAnchor="middle"
                  fontSize={isHovered ? '14' : '10'}
                  style={{ userSelect: 'none', transition: 'all 0.15s ease' }}
                >
                  {qualityOpt.emoji}
                </text>
              </g>
            )
          })}
        </svg>

        {hoveredPoint && (
          <Box
            style={{
              position: 'absolute',
              left: Math.min(width - 120, Math.max(80, hoveredPoint.x)),
              top: Math.max(10, hoveredPoint.y - 50),
              transform: 'translate(-50%, -100%)',
              background: 'rgba(15, 23, 42, 0.94)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(192, 132, 252, 0.4)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              borderRadius: 8,
              padding: '6px 10px',
              pointerEvents: 'none',
              zIndex: 10,
              whiteSpace: 'nowrap'
            }}
          >
            <Group gap={6} align="center">
              <Text size="16px" style={{ lineHeight: 1 }}>
                {getSleepQualityOption(hoveredPoint.quality).emoji}
              </Text>
              <Text size="xs" fw={700} c="#fff">
                {hoveredPoint.hours.toFixed(1)}h dormidas
              </Text>
            </Group>

            <Group gap={4} mt={2} align="center">
              <Text size="10px" fw={600} style={{ color: getSleepQualityOption(hoveredPoint.quality).color }}>
                {getSleepQualityOption(hoveredPoint.quality).label}
              </Text>
              <Text size="10px" c="dimmed">
                • {getSleepStatus(hoveredPoint.hours).label}
              </Text>
            </Group>

            <Text size="9px" c="dimmed" mt={2}>
              Dia {hoveredPoint.day} • Clique para editar
            </Text>
          </Box>
        )}

        {!hasData && (
          <Box
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(15, 23, 42, 0.5)',
              backdropFilter: 'blur(2px)'
            }}
          >
            <Text size="xs" fw={600} c="dimmed" mb={4}>
              Nenhum check-in de sono registrado neste mês.
            </Text>
            <Text
              size="xs"
              fw={700}
              c="#c084fc"
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => onOpenCheckinModal(activeTargetDate)}
            >
              Fazer primeiro check-in
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default SleepHistoryChart
