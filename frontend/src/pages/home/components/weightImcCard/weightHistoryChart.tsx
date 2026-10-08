import { useMemo } from 'react'
import { Box, Text, Group } from '@mantine/core'
import { TbArrowUpRight, TbArrowDownRight, TbMinus, TbCalendarStats } from 'react-icons/tb'
import { getTodayDateString } from '@stores/health/utils'
import type { WeightHistoryChartProps } from './types'

// Gera caminho Bézier suave (Catmull-Rom para Bézier cúbico)
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

function getPast7Days(todayStr: string) {
  const [yyyy, mm, dd] = todayStr.split('-').map(Number)
  const baseDate = new Date(yyyy, mm - 1, dd, 12, 0, 0)
  const days: {
    date: string
    dayName: string
    shortDate: string
    isToday: boolean
  }[] = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date(baseDate)
    d.setDate(baseDate.getDate() - i)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dayNum = String(d.getDate()).padStart(2, '0')
    const date = `${y}-${m}-${dayNum}`

    const isToday = i === 0
    const rawName = isToday
      ? 'Hoje'
      : d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
    const dayName = rawName.charAt(0).toUpperCase() + rawName.slice(1)
    const shortDate = `${dayNum}/${m}`

    days.push({
      date,
      dayName,
      shortDate,
      isToday
    })
  }

  return days
}

export const WeightHistoryChart = ({
  records,
  onStartTodayCheckin
}: WeightHistoryChartProps) => {
  const todayStr = getTodayDateString()

  const {
    daySlots,
    todaySlot,
    minWeight,
    maxWeight,
    width,
    height,
    paddingX,
    paddingTop,
    paddingBottom,
    pathD,
    areaD,
    hasAnyRecords
  } = useMemo(() => {
    const pastDays = getPast7Days(todayStr)
    const sortedRecords = [...records].sort((a, b) => a.date.localeCompare(b.date))

    // Calcula os 7 slots diários e a variação em relação ao registro anterior
    const slots = pastDays.map((slot, index) => {
      const record = sortedRecords.find((r) => r.date === slot.date)

      let diff: number | null = null
      if (record) {
        // Encontra o registro mais recente antes dessa data
        const priorRecords = sortedRecords.filter((r) => r.date < slot.date)
        if (priorRecords.length > 0) {
          const prev = priorRecords[priorRecords.length - 1]
          diff = Math.round((record.weight - prev.weight) * 10) / 10
        }
      }

      return {
        ...slot,
        index,
        record,
        weight: record ? record.weight : null,
        diff
      }
    })

    const weightsWithValues = slots
      .map((s) => s.weight)
      .filter((w): w is number => w !== null)

    const allHistoryWeights = sortedRecords.map((r) => r.weight)
    const combinedWeights = weightsWithValues.length > 0 ? weightsWithValues : allHistoryWeights

    const minW = combinedWeights.length > 0 ? Math.min(...combinedWeights) : 70
    const maxW = combinedWeights.length > 0 ? Math.max(...combinedWeights) : 70
    const pad = Math.max(0.6, (maxW - minW) * 0.25 || 1.2)
    const chartMin = Math.floor((minW - pad) * 10) / 10
    const chartMax = Math.ceil((maxW + pad) * 10) / 10
    const range = chartMax - chartMin || 1

    const w = 500
    const h = 138
    const pX = 38
    const pTop = 28
    const pBottom = 26
    const innerW = w - pX * 2
    const innerH = h - pTop - pBottom

    // Mapeia coordenadas x para cada um dos 7 dias
    const slotsWithCoords = slots.map((s, i) => {
      const x = pX + (i / 6) * innerW
      const y =
        s.weight !== null
          ? pTop + innerH - ((s.weight - chartMin) / range) * innerH
          : null

      return {
        ...s,
        x: Math.round(x * 10) / 10,
        y: y !== null ? Math.round(y * 10) / 10 : null
      }
    })

    const activePoints = slotsWithCoords
      .filter((s): s is typeof s & { y: number } => s.y !== null)
      .map((s) => ({ x: s.x, y: s.y, slot: s }))

    const pD = createSmoothPath(activePoints)
    const aD =
      activePoints.length > 1
        ? `${pD} L ${activePoints[activePoints.length - 1].x} ${h - pBottom} L ${activePoints[0].x} ${h - pBottom} Z`
        : ''

    const todayS = slotsWithCoords.find((s) => s.isToday) || slotsWithCoords[6]

    return {
      daySlots: slotsWithCoords,
      registeredPoints: activePoints,
      todaySlot: todayS,
      minWeight: minW,
      maxWeight: maxW,
      width: w,
      height: h,
      paddingX: pX,
      paddingTop: pTop,
      paddingBottom: pBottom,
      pathD: pD,
      areaD: aD,
      hasAnyRecords: sortedRecords.length > 0
    }
  }, [records, todayStr])

  return (
    <Box>
      {/* Header do Gráfico com Resumo das Atualizações */}
      <Group justify="space-between" align="center" mb={6}>
        <Group gap={6} align="center">
          <TbCalendarStats size={15} color="#818cf8" />
          <Text
            size="11px"
            fw={600}
            c="dimmed"
            style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}
          >
            Acompanhamento Dia a Dia
          </Text>

          {todaySlot.weight !== null ? (
            <Text size="11px" fw={700} c="#4ade80">
              • Hoje: {todaySlot.weight.toFixed(1)} kg
            </Text>
          ) : (
            <Text size="11px" fw={600} c="#fbbf24">
              • Hoje: Check-in pendente
            </Text>
          )}
        </Group>

        {hasAnyRecords && (
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

      {/* Gráfico SVG com os 7 Dias Consecutivos e Curva de Atualizações */}
      <Box
        style={{
          borderRadius: 10,
          background: 'rgba(255, 255, 255, 0.015)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '6px 2px 2px 2px',
          overflow: 'hidden'
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          <defs>
            <linearGradient id="minimalWeightArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="minimalWeightLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <filter id="todayActiveGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#38bdf8" floodOpacity="0.95" />
            </filter>
          </defs>

          {/* Linhas guias horizontais sutis */}
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
            y1={height - paddingBottom}
            x2={width - paddingX}
            y2={height - paddingBottom}
            stroke="rgba(255, 255, 255, 0.06)"
          />

          {/* Colunas verticais discretas para cada dia */}
          {daySlots.map((slot) => (
            <line
              key={slot.date}
              x1={slot.x}
              y1={paddingTop}
              x2={slot.x}
              y2={height - paddingBottom}
              stroke={slot.isToday ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.02)'}
              strokeDasharray={slot.isToday ? '2 2' : undefined}
            />
          ))}

          {/* Área com gradiente */}
          {areaD && <path d={areaD} fill="url(#minimalWeightArea)" />}

          {/* Linha principal Bézier conectando as atualizações */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="url(#minimalWeightLine)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Renderização de cada dia no gráfico */}
          {daySlots.map((slot) => {
            const weight = slot.weight
            const y = slot.y
            const isToday = slot.isToday

            return (
              <g key={slot.date}>
                {weight !== null && y !== null ? (
                  isToday ? (
                    /* Ponto do Dia de Hoje */
                    <g filter="url(#todayActiveGlow)">
                      <circle
                        cx={slot.x}
                        cy={y}
                        r="6.5"
                        fill="#0b1329"
                        stroke="#38bdf8"
                        strokeWidth="2.6"
                      />
                      <circle cx={slot.x} cy={y} r="2.2" fill="#ffffff" />

                      {/* Tag com o peso de hoje */}
                      <g>
                        <rect
                          x={slot.x - 26}
                          y={y - 21}
                          width="52"
                          height="15"
                          rx="4"
                          fill="#0f172a"
                          stroke="#38bdf8"
                          strokeWidth="1"
                        />
                        <text
                          x={slot.x}
                          y={y - 10}
                          textAnchor="middle"
                          fill="#38bdf8"
                          fontSize="9.5"
                          fontWeight="700"
                        >
                          {weight.toFixed(1)} kg
                        </text>
                      </g>
                    </g>
                  ) : (
                    /* Ponto de outros dias com registro */
                    <g>
                      <circle
                        cx={slot.x}
                        cy={y}
                        r="3.5"
                        fill="#0b1329"
                        stroke="rgba(255, 255, 255, 0.55)"
                        strokeWidth="1.8"
                      />
                      <circle cx={slot.x} cy={y} r="1.4" fill="#ffffff" />
                      <text
                        x={slot.x}
                        y={y - 7}
                        textAnchor="middle"
                        fill="rgba(255, 255, 255, 0.7)"
                        fontSize="9"
                        fontWeight="500"
                      >
                        {weight.toFixed(1)}
                      </text>
                    </g>
                  )
                ) : (
                  /* Dia sem registro */
                  isToday && (
                    <g>
                      <circle
                        cx={slot.x}
                        cy={height - paddingBottom - 18}
                        r="4.5"
                        fill="#0b1329"
                        stroke="#fbbf24"
                        strokeWidth="1.8"
                        strokeDasharray="2 2"
                      />
                      <text
                        x={slot.x}
                        y={height - paddingBottom - 26}
                        textAnchor="middle"
                        fill="#fbbf24"
                        fontSize="8.5"
                        fontWeight="600"
                      >
                        Pendente
                      </text>
                    </g>
                  )
                )}

                {/* Rótulo da data no rodapé do SVG */}
                <text
                  x={slot.x}
                  y={height - 8}
                  textAnchor="middle"
                  fill={isToday ? '#38bdf8' : 'rgba(255, 255, 255, 0.45)'}
                  fontSize="8.5"
                  fontWeight={isToday ? '700' : '500'}
                >
                  {isToday ? 'Hoje' : slot.dayName}
                </text>
              </g>
            )
          })}
        </svg>
      </Box>

      {/* Grid Minimalista com as Atualizações Dia a Dia */}
      <Box mt={10}>
        <Group
          justify="space-between"
          gap={6}
          wrap="nowrap"
          style={{ overflowX: 'auto', paddingBottom: 2 }}
        >
          {daySlots.map((slot) => {
            const isToday = slot.isToday
            const hasWeight = slot.weight !== null

            return (
              <Box
                key={slot.date}
                style={{
                  flex: 1,
                  minWidth: 54,
                  borderRadius: 8,
                  background: isToday
                    ? hasWeight
                      ? 'rgba(56, 189, 248, 0.08)'
                      : 'rgba(251, 191, 36, 0.08)'
                    : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${
                    isToday
                      ? hasWeight
                        ? 'rgba(56, 189, 248, 0.25)'
                        : 'rgba(251, 191, 36, 0.25)'
                      : 'rgba(255, 255, 255, 0.05)'
                  }`,
                  padding: '6px 4px',
                  textAlign: 'center',
                  cursor: isToday && onStartTodayCheckin ? 'pointer' : 'default',
                  transition: 'all 0.2s ease'
                }}
                onClick={isToday && onStartTodayCheckin ? onStartTodayCheckin : undefined}
                title={
                  isToday
                    ? 'Clique para editar seu check-in de hoje'
                    : slot.record
                      ? `Peso: ${slot.record.weight.toFixed(1)} kg em ${slot.shortDate}`
                      : `Sem registro em ${slot.shortDate}`
                }
              >
                {/* Nome do dia e data */}
                <Text
                  size="9.5px"
                  fw={isToday ? 700 : 500}
                  c={isToday ? (hasWeight ? '#38bdf8' : '#fbbf24') : 'dimmed'}
                  style={{ lineHeight: 1.2 }}
                >
                  {isToday ? 'Hoje' : slot.dayName}
                </Text>
                <Text size="8.5px" c="dimmed" style={{ opacity: 0.7, lineHeight: 1.1 }}>
                  {slot.shortDate}
                </Text>

                {/* Peso do dia */}
                <Text
                  size="11px"
                  fw={700}
                  c={hasWeight ? (isToday ? '#4ade80' : 'white') : 'dimmed'}
                  mt={4}
                  style={{ lineHeight: 1.2 }}
                >
                  {hasWeight ? `${slot.weight?.toFixed(1)}` : '--'}
                </Text>

                {/* Variação da atualização em relação ao anterior */}
                <Box mt={2}>
                  {slot.diff !== null ? (
                    <Group gap={2} justify="center" align="center" wrap="nowrap">
                      {slot.diff > 0 ? (
                        <>
                          <TbArrowUpRight size={10} color="#fb923c" />
                          <Text size="8.5px" fw={600} c="#fb923c">
                            +{slot.diff}
                          </Text>
                        </>
                      ) : slot.diff < 0 ? (
                        <>
                          <TbArrowDownRight size={10} color="#4ade80" />
                          <Text size="8.5px" fw={600} c="#4ade80">
                            {slot.diff}
                          </Text>
                        </>
                      ) : (
                        <>
                          <TbMinus size={9} color="rgba(255, 255, 255, 0.4)" />
                          <Text size="8.5px" c="dimmed">
                            0.0
                          </Text>
                        </>
                      )}
                    </Group>
                  ) : (
                    <Text size="8.5px" c="dimmed" style={{ opacity: 0.4 }}>
                      •
                    </Text>
                  )}
                </Box>
              </Box>
            )
          })}
        </Group>
      </Box>
    </Box>
  )
}

export default WeightHistoryChart
