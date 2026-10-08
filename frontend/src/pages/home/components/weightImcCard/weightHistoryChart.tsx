import { Box, Text, Group } from '@mantine/core'
import { formatDateDisplay } from '@stores/health/utils'
import type { WeightHistoryChartProps } from './types'

export const WeightHistoryChart = ({ records }: WeightHistoryChartProps) => {
  if (records.length === 0) {
    return (
      <Box
        py="xl"
        ta="center"
        style={{
          borderRadius: 12,
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed rgba(255, 255, 255, 0.1)'
        }}
      >
        <Text size="sm" c="dimmed">
          Nenhum registro de peso ainda.
        </Text>
        <Text size="xs" c="dimmed" mt={4}>
          Cadastre seu peso acima para iniciar o histórico e metrificar sua evolução.
        </Text>
      </Box>
    )
  }

  // Pegamos os últimos até 10 registros para clareza
  const displayRecords = records.slice(-10)
  const weights = displayRecords.map((r) => r.weight)
  const minWeight = Math.min(...weights)
  const maxWeight = Math.max(...weights)
  const paddingWeight = Math.max(1, (maxWeight - minWeight) * 0.2 || 2)
  const chartMin = Math.floor((minWeight - paddingWeight) * 10) / 10
  const chartMax = Math.ceil((maxWeight + paddingWeight) * 10) / 10
  const range = chartMax - chartMin || 1

  const width = 500
  const height = 140
  const paddingX = 40
  const paddingY = 24
  const innerWidth = width - paddingX * 2
  const innerHeight = height - paddingY * 2

  const points = displayRecords.map((r, i) => {
    const x =
      displayRecords.length === 1
        ? width / 2
        : paddingX + (i / (displayRecords.length - 1)) * innerWidth
    const y = paddingY + innerHeight - ((r.weight - chartMin) / range) * innerHeight
    return { x, y, record: r }
  })

  const pathD = points.reduce((acc, curr, index) => {
    if (index === 0) return `M ${curr.x} ${curr.y}`
    return `${acc} L ${curr.x} ${curr.y}`
  }, '')

  const areaD =
    points.length > 1
      ? `${pathD} L ${points[points.length - 1].x} ${height - 6} L ${points[0].x} ${height - 6} Z`
      : ''

  return (
    <Box>
      <Group justify="space-between" mb="xs">
        <Text size="xs" fw={600} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Evolução Recente ({displayRecords.length} {displayRecords.length === 1 ? 'registro' : 'registros'})
        </Text>
        <Group gap="xs">
          <Text size="xs" c="dimmed">
            Min: <span style={{ color: '#818cf8', fontWeight: 600 }}>{minWeight} kg</span>
          </Text>
          <Text size="xs" c="dimmed">
            Max: <span style={{ color: '#a78bfa', fontWeight: 600 }}>{maxWeight} kg</span>
          </Text>
        </Group>
      </Group>

      <Box
        style={{
          borderRadius: 12,
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '12px 8px 8px 8px',
          overflow: 'hidden'
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          <defs>
            <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="chartLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>

          {/* Linhas guia horizontais sutis */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={paddingY + innerHeight / 2}
            x2={width - paddingX}
            y2={paddingY + innerHeight / 2}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="rgba(255, 255, 255, 0.08)"
          />

          {/* Área sombreada */}
          {areaD && <path d={areaD} fill="url(#chartAreaGrad)" />}

          {/* Linha do gráfico */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="url(#chartLineGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Pontos com valor */}
          {points.map((pt, idx) => (
            <g key={idx}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="5"
                fill="#0f172a"
                stroke="#38bdf8"
                strokeWidth="2.5"
              />
              <circle cx={pt.x} cy={pt.y} r="2" fill="#ffffff" />
              <text
                x={pt.x}
                y={pt.y - 10}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10"
                fontWeight="600"
              >
                {pt.record.weight}
              </text>
              <text
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                fill="rgba(255, 255, 255, 0.45)"
                fontSize="9"
              >
                {formatDateDisplay(pt.record.date)}
              </text>
            </g>
          ))}
        </svg>
      </Box>
    </Box>
  )
}

export default WeightHistoryChart
