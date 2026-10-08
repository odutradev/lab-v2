import { Box, Text, Group } from '@mantine/core'
import { getTodayDateString, formatDateDisplay } from '@stores/health/utils'
import type { WeightHistoryChartProps } from './types'

export const WeightHistoryChart = ({ records }: WeightHistoryChartProps) => {
  const todayStr = getTodayDateString()

  if (records.length === 0) {
    return (
      <Box
        py="lg"
        px="md"
        ta="center"
        style={{
          borderRadius: 10,
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed rgba(255, 255, 255, 0.08)'
        }}
      >
        <Text size="xs" fw={600} c="dimmed">
          Nenhum registro de peso no histórico
        </Text>
        <Text size="11px" c="dimmed" mt={2}>
          Faça seu check-in diário para iniciar o gráfico e acompanhar suas métricas.
        </Text>
      </Box>
    )
  }

  // Pegamos os últimos registros (até 8 para não amontoar em telas menores)
  const displayRecords = records.slice(-8)
  const todayRecord = displayRecords.find((r) => r.date === todayStr)

  const weights = displayRecords.map((r) => r.weight)
  const minWeight = Math.min(...weights)
  const maxWeight = Math.max(...weights)
  const paddingWeight = Math.max(0.8, (maxWeight - minWeight) * 0.25 || 1.5)
  const chartMin = Math.floor((minWeight - paddingWeight) * 10) / 10
  const chartMax = Math.ceil((maxWeight + paddingWeight) * 10) / 10
  const range = chartMax - chartMin || 1

  const width = 500
  const height = 130
  const paddingX = 40
  const paddingTop = 26
  const paddingBottom = 22
  const innerWidth = width - paddingX * 2
  const innerHeight = height - paddingTop - paddingBottom

  const points = displayRecords.map((r, i) => {
    const x =
      displayRecords.length === 1
        ? width / 2
        : paddingX + (i / (displayRecords.length - 1)) * innerWidth
    const y = paddingTop + innerHeight - ((r.weight - chartMin) / range) * innerHeight
    const isToday = r.date === todayStr
    return { x, y, record: r, isToday }
  })

  const pathD = points.reduce((acc, curr, index) => {
    if (index === 0) return `M ${curr.x} ${curr.y}`
    return `${acc} L ${curr.x} ${curr.y}`
  }, '')

  const areaD =
    points.length > 1
      ? `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom + 4} L ${points[0].x} ${height - paddingBottom + 4} Z`
      : ''

  return (
    <Box>
      <Group justify="space-between" align="center" mb={6}>
        <Group gap={6} align="center">
          <Text size="xs" fw={600} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Gráfico de Peso
          </Text>
          {todayRecord ? (
            <Text size="11px" fw={700} c="#4ade80">
              • Hoje: {todayRecord.weight.toFixed(1)} kg
            </Text>
          ) : (
            <Text size="11px" fw={600} c="#fbbf24">
              • Hoje pendente
            </Text>
          )}
        </Group>

        <Group gap="xs">
          <Text size="11px" c="dimmed">
            Mín: <span style={{ color: '#818cf8', fontWeight: 600 }}>{minWeight.toFixed(1)} kg</span>
          </Text>
          <Text size="11px" c="dimmed">
            Máx: <span style={{ color: '#a78bfa', fontWeight: 600 }}>{maxWeight.toFixed(1)} kg</span>
          </Text>
        </Group>
      </Group>

      <Box
        style={{
          borderRadius: 10,
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '8px 4px 4px 4px',
          overflow: 'hidden'
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          <defs>
            <linearGradient id="chartWeightAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="chartWeightLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <filter id="todayGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#38bdf8" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Linhas guia horizontais discretas */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={width - paddingX}
            y2={paddingTop}
            stroke="rgba(255, 255, 255, 0.04)"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={paddingTop + innerHeight / 2}
            x2={width - paddingX}
            y2={paddingTop + innerHeight / 2}
            stroke="rgba(255, 255, 255, 0.04)"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={height - paddingBottom}
            x2={width - paddingX}
            y2={height - paddingBottom}
            stroke="rgba(255, 255, 255, 0.06)"
          />

          {/* Área preenchida */}
          {areaD && <path d={areaD} fill="url(#chartWeightAreaGrad)" />}

          {/* Linha do gráfico */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="url(#chartWeightLineGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Pontos normais e linha de hoje */}
          {points.map((pt, idx) => {
            const isLatest = idx === points.length - 1

            return (
              <g key={idx}>
                {/* Linha vertical destacando o dia de hoje */}
                {pt.isToday && (
                  <line
                    x1={pt.x}
                    y1={pt.y}
                    x2={pt.x}
                    y2={height - paddingBottom}
                    stroke="rgba(56, 189, 248, 0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Marcador do ponto */}
                {pt.isToday ? (
                  /* Ponto do Dia de Hoje com indicador especial */
                  <g filter="url(#todayGlow)">
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="6.5"
                      fill="#0f172a"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                    />
                    <circle cx={pt.x} cy={pt.y} r="2.5" fill="#ffffff" />
                  </g>
                ) : (
                  /* Ponto histórico comum */
                  <g>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="3.5"
                      fill="#0f172a"
                      stroke={isLatest ? '#818cf8' : 'rgba(255, 255, 255, 0.4)'}
                      strokeWidth="1.8"
                    />
                    <circle cx={pt.x} cy={pt.y} r="1.5" fill="#ffffff" />
                  </g>
                )}

                {/* Rótulo de peso acima do ponto */}
                {pt.isToday ? (
                  <g>
                    <rect
                      x={pt.x - 24}
                      y={pt.y - 20}
                      width="48"
                      height="14"
                      rx="4"
                      fill="#0f172a"
                      stroke="#38bdf8"
                      strokeWidth="1"
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 10}
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize="9"
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
                    fill="rgba(255, 255, 255, 0.7)"
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
                  fontWeight={pt.isToday ? '700' : '500'}
                >
                  {pt.isToday ? 'Hoje' : formatDateDisplay(pt.record.date)}
                </text>
              </g>
            )
          })}
        </svg>
      </Box>
    </Box>
  )
}

export default WeightHistoryChart
