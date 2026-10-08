import { useMemo } from 'react'
import { Box, Text, Group } from '@mantine/core'
import { getTodayDateString, formatDateDisplay } from '@stores/health/utils'
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

export const WeightHistoryChart = ({ records }: WeightHistoryChartProps) => {
  const todayStr = getTodayDateString()

  const {
    todayRecord,
    minWeight,
    maxWeight,
    width,
    height,
    paddingX,
    paddingTop,
    paddingBottom,
    points,
    pendingTodayPoint,
    pathD,
    areaD
  } = useMemo(() => {
    const today = records.find((r) => r.date === todayStr)
    const recent = records.slice(-7)

    const wList = recent.map((r) => r.weight)
    const minW = wList.length > 0 ? Math.min(...wList) : 70
    const maxW = wList.length > 0 ? Math.max(...wList) : 70
    const pad = Math.max(0.6, (maxW - minW) * 0.25 || 1.2)
    const cMin = Math.floor((minW - pad) * 10) / 10
    const cMax = Math.ceil((maxW + pad) * 10) / 10
    const rng = cMax - cMin || 1

    const w = 480
    const h = 136
    const pX = 42
    const pTop = 28
    const pBottom = 26
    const innerW = w - pX * 2
    const innerH = h - pTop - pBottom

    // Se hoje não está nos registros recentes mas temos histórico, criamos ponto virtual para "Hoje"
    const hasTodayInList = recent.some((r) => r.date === todayStr)
    const totalSlots = hasTodayInList ? recent.length : recent.length + 1

    const pts = recent.map((r, i) => {
      const x =
        totalSlots <= 1
          ? w / 2
          : pX + (i / (totalSlots - 1)) * innerW
      const y = pTop + innerH - ((r.weight - cMin) / rng) * innerH
      return {
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        record: r,
        isToday: r.date === todayStr
      }
    })

    let pendingPt = null
    if (!hasTodayInList && recent.length > 0) {
      const lastRecorded = pts[pts.length - 1]
      const x = pX + ((totalSlots - 1) / (totalSlots - 1)) * innerW
      const y = lastRecorded.y
      pendingPt = {
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        lastX: lastRecorded.x,
        lastY: lastRecorded.y
      }
    }

    const pD = createSmoothPath(pts)
    const aD =
      pts.length > 1
        ? `${pD} L ${pts[pts.length - 1].x} ${h - pBottom} L ${pts[0].x} ${h - pBottom} Z`
        : ''

    return {
      displayRecords: recent,
      todayRecord: today,
      weights: wList,
      minWeight: minW,
      maxWeight: maxW,
      chartMin: cMin,
      range: rng,
      width: w,
      height: h,
      paddingX: pX,
      paddingTop: pTop,
      paddingBottom: pBottom,
      points: pts,
      pendingTodayPoint: pendingPt,
      pathD: pD,
      areaD: aD
    }
  }, [records, todayStr])

  if (records.length === 0) {
    return (
      <Box
        py="lg"
        px="md"
        ta="center"
        style={{
          borderRadius: 8,
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed rgba(255, 255, 255, 0.08)'
        }}
      >
        <Text size="xs" fw={600} c="dimmed">
          Nenhum registro de peso no histórico
        </Text>
        <Text size="11px" c="dimmed" mt={2}>
          Faça seu check-in diário acima para visualizar a evolução no gráfico.
        </Text>
      </Box>
    )
  }

  return (
    <Box>
      <Group justify="space-between" align="center" mb={6}>
        <Group gap={6} align="center">
          <Text
            size="11px"
            fw={600}
            c="dimmed"
            style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}
          >
            Evolução do Peso
          </Text>

          {todayRecord ? (
            <Text size="11px" fw={700} c="#4ade80">
              • Peso de hoje: {todayRecord.weight.toFixed(1)} kg
            </Text>
          ) : (
            <Text size="11px" fw={600} c="#fbbf24">
              • Peso de hoje: Pendente
            </Text>
          )}
        </Group>

        <Group gap="xs">
          <Text size="11px" c="dimmed">
            Mín <span style={{ color: '#818cf8', fontWeight: 600 }}>{minWeight.toFixed(1)}</span>
          </Text>
          <Text size="11px" c="dimmed">
            • Máx <span style={{ color: '#38bdf8', fontWeight: 600 }}>{maxWeight.toFixed(1)} kg</span>
          </Text>
        </Group>
      </Group>

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
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="minimalWeightLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <filter id="todayActiveGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#38bdf8" floodOpacity="0.9" />
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

          {/* Área com gradiente */}
          {areaD && <path d={areaD} fill="url(#minimalWeightArea)" />}

          {/* Linha principal Bézier */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="url(#minimalWeightLine)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Linha projetada se o peso de hoje ainda estiver pendente */}
          {pendingTodayPoint && (
            <line
              x1={pendingTodayPoint.lastX}
              y1={pendingTodayPoint.lastY}
              x2={pendingTodayPoint.x}
              y2={pendingTodayPoint.y}
              stroke="rgba(251, 191, 36, 0.4)"
              strokeWidth="1.8"
              strokeDasharray="3 3"
            />
          )}

          {/* Pontos históricos */}
          {points.map((pt, idx) => {
            return (
              <g key={idx}>
                {/* Linha vertical guia para o dia de hoje */}
                {pt.isToday && (
                  <line
                    x1={pt.x}
                    y1={pt.y}
                    x2={pt.x}
                    y2={height - paddingBottom}
                    stroke="rgba(56, 189, 248, 0.4)"
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Marcador do ponto */}
                {pt.isToday ? (
                  <g filter="url(#todayActiveGlow)">
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="6"
                      fill="#0b1329"
                      stroke="#38bdf8"
                      strokeWidth="2.4"
                    />
                    <circle cx={pt.x} cy={pt.y} r="2.2" fill="#ffffff" />
                  </g>
                ) : (
                  <g>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="3.2"
                      fill="#0b1329"
                      stroke="rgba(255, 255, 255, 0.45)"
                      strokeWidth="1.6"
                    />
                    <circle cx={pt.x} cy={pt.y} r="1.4" fill="#ffffff" />
                  </g>
                )}

                {/* Rótulo de peso acima do ponto */}
                {pt.isToday ? (
                  <g>
                    <rect
                      x={pt.x - 26}
                      y={pt.y - 20}
                      width="52"
                      height="15"
                      rx="4"
                      fill="#0f172a"
                      stroke="#38bdf8"
                      strokeWidth="1"
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 9}
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize="9.5"
                      fontWeight="700"
                    >
                      {pt.record.weight.toFixed(1)} kg
                    </text>
                  </g>
                ) : (
                  <text
                    x={pt.x}
                    y={pt.y - 7}
                    textAnchor="middle"
                    fill="rgba(255, 255, 255, 0.65)"
                    fontSize="9"
                    fontWeight="500"
                  >
                    {pt.record.weight.toFixed(1)}
                  </text>
                )}

                {/* Rótulo de data no rodapé */}
                <text
                  x={pt.x}
                  y={height - 8}
                  textAnchor="middle"
                  fill={pt.isToday ? '#38bdf8' : 'rgba(255, 255, 255, 0.4)'}
                  fontSize="8.5"
                  fontWeight={pt.isToday ? '700' : '400'}
                >
                  {pt.isToday ? 'Hoje' : formatDateDisplay(pt.record.date)}
                </text>
              </g>
            )
          })}

          {/* Marcador de Hoje quando pendente */}
          {pendingTodayPoint && (
            <g>
              <line
                x1={pendingTodayPoint.x}
                y1={pendingTodayPoint.y}
                x2={pendingTodayPoint.x}
                y2={height - paddingBottom}
                stroke="rgba(251, 191, 36, 0.3)"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={pendingTodayPoint.x}
                cy={pendingTodayPoint.y}
                r="4.5"
                fill="#0b1329"
                stroke="#fbbf24"
                strokeWidth="1.8"
                strokeDasharray="2 2"
              />
              <text
                x={pendingTodayPoint.x}
                y={pendingTodayPoint.y - 8}
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="8.5"
                fontWeight="600"
              >
                Pendente
              </text>
              <text
                x={pendingTodayPoint.x}
                y={height - 8}
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="8.5"
                fontWeight="700"
              >
                Hoje
              </text>
            </g>
          )}
        </svg>
      </Box>
    </Box>
  )
}

export default WeightHistoryChart
