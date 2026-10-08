import { useMemo, useState } from 'react'
import { Box, Text, Group } from '@mantine/core'
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
  const [hoveredDay, setHoveredDay] = useState<{
    date: string
    day: number
    weight: number
    imc: number
    x: number
    weightY: number
    imcY: number
  } | null>(null)

  const {
    activePoints,
    minWeight,
    maxWeight,
    width,
    height,
    paddingX,
    paddingTop,
    paddingBottom,
    weightPathD,
    weightAreaD,
    imcPathD,
    imcAreaD,
    axisTicks
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
    const h = 180
    const pX = 36
    const pTop = 30
    const pBottom = 28
    const innerW = w - pX * 2
    const innerH = h - pTop - pBottom

    const zoneH = innerH * 0.42
    const zoneSpacing = innerH * 0.16

    const pointsWithCoords = recordedDays.map((d) => {
      const x = pX + ((d.day - 1) / (daysInMonth - 1)) * innerW
      const weightY = pTop + zoneH - ((d.weight - chartMinW) / rangeW) * zoneH
      const imcY = pTop + zoneH + zoneSpacing + zoneH - ((d.imc - chartMinI) / rangeI) * zoneH

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
        ? `${pDWeight} L ${weightPoints[weightPoints.length - 1].x} ${pTop + zoneH + 4} L ${weightPoints[0].x} ${pTop + zoneH + 4} Z`
        : ''

    const pDImc = createSmoothPath(imcPoints)
    const aDImc =
      imcPoints.length > 1
        ? `${pDImc} L ${imcPoints[imcPoints.length - 1].x} ${h - pBottom} L ${imcPoints[0].x} ${h - pBottom} Z`
        : ''

    const todayP = pointsWithCoords.find((p) => p.isToday) || null

    const ticks: { day: number; x: number }[] = []
    const step = 5
    for (let day = 1; day <= daysInMonth; day += step) {
      const x = pX + ((day - 1) / (daysInMonth - 1)) * innerW
      ticks.push({ day, x: Math.round(x * 10) / 10 })
    }
    if (ticks[ticks.length - 1].day !== daysInMonth) {
      ticks.push({
        day: daysInMonth,
        x: pX + innerW
      })
    }

    return {
      monthDaysCount: daysInMonth,
      monthRecords: filtered,
      activePoints: pointsWithCoords,
      minWeight: minW,
      maxWeight: maxW,
      width: w,
      height: h,
      paddingX: pX,
      paddingTop: pTop,
      paddingBottom: pBottom,
      weightPathD: pDWeight,
      weightAreaD: aDWeight,
      imcPathD: pDImc,
      imcAreaD: aDImc,
      todayPoint: todayP,
      axisTicks: ticks
    }
  }, [records, selectedYear, selectedMonth, heightCm, todayStr, activeTargetDate])

  const hasData = activePoints.length > 0

  return (
    <Box>
      <Group justify="space-between" align="center" mb={10}>
        <Group gap="md" align="center">
          <Group gap={6} align="center">
            <Box style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#38bdf8' }} />
            <Text size="11px" fw={600} c="#38bdf8">
              Peso (kg)
            </Text>
          </Group>

          <Group gap={6} align="center">
            <Box style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#c084fc' }} />
            <Text size="11px" fw={600} c="#c084fc">
              IMC (kg/m²)
            </Text>
          </Group>
        </Group>

        {hasData && (
          <Group gap="xs">
            <Text size="11px" c="dimmed">
              Mín <span style={{ color: '#818cf8', fontWeight: 600 }}>{minWeight.toFixed(1)}</span>
            </Text>
            <Text size="11px" c="dimmed">
              • Máx <span style={{ color: '#38bdf8', fontWeight: 600 }}>{maxWeight.toFixed(1)} kg</span>
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
          onMouseLeave={() => setHoveredDay(null)}
        >
          <defs>
            <linearGradient id="monthWeightAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="monthWeightLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            <linearGradient id="monthImcAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="monthImcLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>

            <filter id="monthGlowWeight" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#38bdf8" floodOpacity="0.9" />
            </filter>
            <filter id="monthGlowImc" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#c084fc" floodOpacity="0.9" />
            </filter>
          </defs>

          <line
            x1={paddingX}
            y1={paddingTop}
            x2={width - paddingX}
            y2={paddingTop}
            stroke="rgba(255, 255, 255, 0.03)"
            strokeDasharray="2 3"
          />
          <line
            x1={paddingX}
            y1={Math.round(height / 2)}
            x2={width - paddingX}
            y2={Math.round(height / 2)}
            stroke="rgba(255, 255, 255, 0.03)"
            strokeDasharray="1 3"
          />
          <line
            x1={paddingX}
            y1={height - paddingBottom}
            x2={width - paddingX}
            y2={height - paddingBottom}
            stroke="rgba(255, 255, 255, 0.06)"
          />

          {axisTicks.map((tick) => (
            <g key={tick.day}>
              <line
                x1={tick.x}
                y1={paddingTop}
                x2={tick.x}
                y2={height - paddingBottom}
                stroke="rgba(255, 255, 255, 0.02)"
              />
              <text
                x={tick.x}
                y={height - 10}
                textAnchor="middle"
                fill="rgba(255, 255, 255, 0.35)"
                fontSize="8"
                fontWeight="500"
              >
                {tick.day}
              </text>
            </g>
          ))}

          {weightAreaD && <path d={weightAreaD} fill="url(#monthWeightAreaGrad)" />}
          {imcAreaD && <path d={imcAreaD} fill="url(#monthImcAreaGrad)" />}

          {weightPathD && (
            <path
              d={weightPathD}
              fill="none"
              stroke="url(#monthWeightLineGrad)"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {imcPathD && (
            <path
              d={imcPathD}
              fill="none"
              stroke="url(#monthImcLineGrad)"
              strokeWidth="2.0"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {activePoints.map((p) => {
            const isHighlighted = p.isTarget || (p.isToday && !targetDate)

            return (
              <g
                key={p.date}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredDay(p)}
                onClick={() => onOpenCheckinModal(p.date)}
              >
                <line
                  x1={p.x}
                  y1={p.weightY}
                  x2={p.x}
                  y2={p.imcY}
                  stroke={isHighlighted ? 'rgba(56, 189, 248, 0.35)' : 'rgba(255, 255, 255, 0.08)'}
                  strokeDasharray="1 2"
                />

                {isHighlighted ? (
                  <g filter="url(#monthGlowWeight)">
                    <circle cx={p.x} cy={p.weightY} r="6" fill="#0b1329" stroke="#38bdf8" strokeWidth="2.4" />
                    <circle cx={p.x} cy={p.weightY} r="2" fill="#ffffff" />
                    <g>
                      <rect
                        x={p.x - 22}
                        y={p.weightY - 18}
                        width="44"
                        height="14"
                        rx="4"
                        fill="#0f172a"
                        stroke="#38bdf8"
                        strokeWidth="0.9"
                      />
                      <text
                        x={p.x}
                        y={p.weightY - 8}
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="8.5"
                        fontWeight="700"
                      >
                        {p.weight.toFixed(1)}k
                      </text>
                    </g>
                  </g>
                ) : (
                  <g>
                    <circle
                      cx={p.x}
                      cy={p.weightY}
                      r="3.2"
                      fill="#0b1329"
                      stroke="#38bdf8"
                      strokeWidth="1.6"
                    />
                    <circle cx={p.x} cy={p.weightY} r="1.3" fill="#ffffff" />
                  </g>
                )}

                {isHighlighted ? (
                  <g filter="url(#monthGlowImc)">
                    <circle cx={p.x} cy={p.imcY} r="5.5" fill="#0b1329" stroke="#c084fc" strokeWidth="2.2" />
                    <circle cx={p.x} cy={p.imcY} r="1.8" fill="#ffffff" />
                    <g>
                      <rect
                        x={p.x - 20}
                        y={p.imcY + 6}
                        width="40"
                        height="13"
                        rx="3"
                        fill="#0f172a"
                        stroke="#c084fc"
                        strokeWidth="0.8"
                      />
                      <text
                        x={p.x}
                        y={p.imcY + 16}
                        textAnchor="middle"
                        fill="#c084fc"
                        fontSize="8"
                        fontWeight="700"
                      >
                        {p.imc.toFixed(1)}
                      </text>
                    </g>
                  </g>
                ) : (
                  <g>
                    <circle
                      cx={p.x}
                      cy={p.imcY}
                      r="2.8"
                      fill="#0b1329"
                      stroke="#c084fc"
                      strokeWidth="1.5"
                    />
                    <circle cx={p.x} cy={p.imcY} r="1.1" fill="#ffffff" />
                  </g>
                )}
              </g>
            )
          })}

          {hoveredDay && (
            <g pointerEvents="none">
              <line
                x1={hoveredDay.x}
                y1={paddingTop}
                x2={hoveredDay.x}
                y2={height - paddingBottom}
                stroke="rgba(255, 255, 255, 0.25)"
                strokeDasharray="2 2"
              />
              <g>
                <rect
                  x={Math.max(10, Math.min(width - 90, hoveredDay.x - 45))}
                  y={4}
                  width="90"
                  height="20"
                  rx="4"
                  fill="#0f172a"
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth="1"
                />
                <text
                  x={Math.max(10, Math.min(width - 90, hoveredDay.x - 45)) + 45}
                  y={17}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="8.5"
                  fontWeight="600"
                >
                  Dia {hoveredDay.day}: {hoveredDay.weight.toFixed(1)}kg • {hoveredDay.imc.toFixed(1)} IMC
                </text>
              </g>
            </g>
          )}

          {!hasData && (
            <g>
              <text
                x={width / 2}
                y={height / 2 - 4}
                textAnchor="middle"
                fill="rgba(255, 255, 255, 0.5)"
                fontSize="11"
                fontWeight="500"
              >
                Nenhum check-in registrado neste mês
              </text>
              <text
                x={width / 2}
                y={height / 2 + 14}
                textAnchor="middle"
                fill="rgba(255, 255, 255, 0.3)"
                fontSize="9.5"
              >
                Clique no ícone de check-in para registrar seu peso
              </text>
            </g>
          )}
        </svg>
      </Box>
    </Box>
  )
}

export default WeightHistoryChart
