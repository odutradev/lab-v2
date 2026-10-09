import { useMemo } from 'react'
import { Box, Text, Group, Tooltip } from '@mantine/core'
import { getTodayDateString, calculateImc } from '@stores/health/utils'
import type { WeightHistoryChartProps } from './types'

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

export const WeightHistoryChart = ({
  records,
  height: heightCm,
  selectedYear,
  selectedMonth,
  targetDate,
  onOpenCheckinModal
}: WeightHistoryChartProps) => {
  const todayStr = getTodayDateString()
  const activeTargetDate = targetDate || todayStr

  const {
    monthDaysCount,
    activePoints,
    minWeight,
    maxWeight,
    width,
    height,
    weightPathD,
    weightAreaD,
    imcPathD,
    imcAreaD
  } = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
    const monthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`

    const filtered = records
      .filter((r) => r.date.startsWith(monthPrefix))
      .sort((a, b) => a.date.localeCompare(b.date))

    const effectiveHeight = heightCm && heightCm > 0 ? heightCm : 170

    const recordedDays = filtered.map((r) => {
      const dayNum = parseInt(r.date.split('-')[2], 10)
      const imcResult = calculateImc(r.weight, effectiveHeight)
      const imc = imcResult ? imcResult.imc : 22
      return {
        date: r.date,
        day: dayNum,
        weight: r.weight,
        imc,
        isToday: r.date === todayStr,
        isTarget: r.date === activeTargetDate
      }
    })

    const weights = recordedDays.map((d) => d.weight)
    const imcs = recordedDays.map((d) => d.imc)

    const minW = weights.length > 0 ? Math.min(...weights) : 60
    const maxW = weights.length > 0 ? Math.max(...weights) : 80
    const padW = Math.max(0.6, (maxW - minW) * 0.25 || 1.2)
    const chartMinW = Math.floor((minW - padW) * 10) / 10
    const chartMaxW = Math.ceil((maxW + padW) * 10) / 10
    const rangeW = chartMaxW - chartMinW || 1

    const minI = imcs.length > 0 ? Math.min(...imcs) : 20
    const maxI = imcs.length > 0 ? Math.max(...imcs) : 26
    const padI = Math.max(0.3, (maxI - minI) * 0.25 || 0.6)
    const chartMinI = Math.floor((minI - padI) * 10) / 10
    const chartMaxI = Math.ceil((maxI + padI) * 10) / 10
    const rangeI = chartMaxI - chartMinI || 1

    const w = 520
    const h = 48
    const pX = 14
    const pTop = 6
    const pBottom = 6
    const innerW = w - pX * 2

    const zoneH = 13
    const imcZoneTop = pTop + 17

    const pointsWithCoords = recordedDays.map((d) => {
      const x = pX + ((d.day - 1) / (daysInMonth - 1)) * innerW
      const weightY = pTop + zoneH - ((d.weight - chartMinW) / rangeW) * zoneH
      const imcY = imcZoneTop + zoneH - ((d.imc - chartMinI) / rangeI) * zoneH

      return {
        ...d,
        x: Math.round(x * 10) / 10,
        weightY: Math.round(weightY * 10) / 10,
        imcY: Math.round(imcY * 10) / 10
      }
    })

    const weightPoints = pointsWithCoords.map((p) => ({ x: p.x, y: p.weightY }))
    const imcPoints = pointsWithCoords.map((p) => ({ x: p.x, y: p.imcY }))

    const pDWeight = createSmoothPath(weightPoints)
    const aDWeight =
      weightPoints.length > 1
        ? `${pDWeight} L ${weightPoints[weightPoints.length - 1].x} ${pTop + zoneH + 2} L ${weightPoints[0].x} ${pTop + zoneH + 2} Z`
        : ''

    const pDImc = createSmoothPath(imcPoints)
    const aDImc =
      imcPoints.length > 1
        ? `${pDImc} L ${imcPoints[imcPoints.length - 1].x} ${h - pBottom} L ${imcPoints[0].x} ${h - pBottom} Z`
        : ''

    return {
      monthDaysCount: daysInMonth,
      activePoints: pointsWithCoords,
      minWeight: minW,
      maxWeight: maxW,
      width: w,
      height: h,
      weightPathD: pDWeight,
      weightAreaD: aDWeight,
      imcPathD: pDImc,
      imcAreaD: aDImc
    }
  }, [records, selectedYear, selectedMonth, heightCm, todayStr, activeTargetDate])

  const hasData = activePoints.length > 0

  return (
    <Box>
      <Group justify="space-between" align="center" mb={6} wrap="wrap" gap="xs">
        <Group gap={8} align="center" wrap="wrap">
          <Group gap={4} align="center">
            <Box w={6} h={6} style={{ borderRadius: '50%', backgroundColor: '#38bdf8' }} />
            <Text size="10px" c="dimmed">
              Peso (kg)
            </Text>
          </Group>

          <Group gap={4} align="center">
            <Box w={6} h={6} style={{ borderRadius: '50%', backgroundColor: '#c084fc' }} />
            <Text size="10px" c="dimmed">
              IMC (kg/m²)
            </Text>
          </Group>
        </Group>

        {hasData ? (
          <Group gap={6} align="center">
            <Text size="10px" c="dimmed">
              Mín <span style={{ color: '#818cf8', fontWeight: 600 }}>{minWeight.toFixed(1)}</span>
            </Text>
            <Text size="10px" c="dimmed">•</Text>
            <Text size="10px" c="dimmed">
              Máx <span style={{ color: '#38bdf8', fontWeight: 600 }}>{maxWeight.toFixed(1)} kg</span>
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
        >
          <defs>
            <linearGradient id="monthWeightAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="monthWeightLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            <linearGradient id="monthImcAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="monthImcLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>

          <line
            x1={14}
            y1={21}
            x2={width - 14}
            y2={21}
            stroke="rgba(255, 255, 255, 0.03)"
            strokeDasharray="1 3"
          />

          {weightAreaD && <path d={weightAreaD} fill="url(#monthWeightAreaGrad)" />}
          {imcAreaD && <path d={imcAreaD} fill="url(#monthImcAreaGrad)" />}

          {weightPathD && (
            <path
              d={weightPathD}
              fill="none"
              stroke="url(#monthWeightLineGrad)"
              strokeWidth="2.0"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {imcPathD && (
            <path
              d={imcPathD}
              fill="none"
              stroke="url(#monthImcLineGrad)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {activePoints.map((p) => {
            const isHighlighted = p.isTarget || (p.isToday && !targetDate)

            return (
              <Tooltip
                key={p.date}
                label={`Dia ${p.day}: ${p.weight.toFixed(1)} kg • IMC ${p.imc.toFixed(1)}`}
                withArrow
                position="top"
              >
                <g
                  style={{ cursor: 'pointer' }}
                  onClick={() => onOpenCheckinModal(p.date)}
                >
                  <line
                    x1={p.x}
                    y1={p.weightY}
                    x2={p.x}
                    y2={p.imcY}
                    stroke={isHighlighted ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.08)'}
                    strokeDasharray="1 2"
                  />

                  {/* Ponto de Peso */}
                  <circle
                    cx={p.x}
                    cy={p.weightY}
                    r={isHighlighted ? 4.2 : 2.5}
                    fill={isHighlighted ? '#38bdf8' : '#0b1329'}
                    stroke={isHighlighted ? '#ffffff' : '#38bdf8'}
                    strokeWidth={isHighlighted ? 1.5 : 1.2}
                  />

                  {/* Ponto de IMC */}
                  <circle
                    cx={p.x}
                    cy={p.imcY}
                    r={isHighlighted ? 4.0 : 2.2}
                    fill={isHighlighted ? '#c084fc' : '#0b1329'}
                    stroke={isHighlighted ? '#ffffff' : '#c084fc'}
                    strokeWidth={isHighlighted ? 1.4 : 1.2}
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
              Sem check-ins neste mês
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
          Dia {monthDaysCount}
        </Text>
      </Group>
    </Box>
  )
}

export default WeightHistoryChart
