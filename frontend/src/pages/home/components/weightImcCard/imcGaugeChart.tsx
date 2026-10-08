import { Box, Group, Text, Badge } from '@mantine/core'
import type { ImcGaugeChartProps } from './types'

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy - r * Math.sin(rad)
  }
}

function describeSector(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number
) {
  const gap = 0.5
  const sAngle = startAngle - gap
  const eAngle = endAngle + gap

  const pOutStart = polarToCartesian(cx, cy, rOuter, sAngle)
  const pOutEnd = polarToCartesian(cx, cy, rOuter, eAngle)
  const pInEnd = polarToCartesian(cx, cy, rInner, eAngle)
  const pInStart = polarToCartesian(cx, cy, rInner, sAngle)

  return `M ${pOutStart.x.toFixed(2)} ${pOutStart.y.toFixed(2)} A ${rOuter} ${rOuter} 0 0 1 ${pOutEnd.x.toFixed(2)} ${pOutEnd.y.toFixed(2)} L ${pInEnd.x.toFixed(2)} ${pInEnd.y.toFixed(2)} A ${rInner} ${rInner} 0 0 0 ${pInStart.x.toFixed(2)} ${pInStart.y.toFixed(2)} Z`
}

interface SectorConfig {
  label: string
  subLabel: string
  color: string
  startAngle: number
  endAngle: number
  minImc: number
  maxImc: number
}

const SECTORS: SectorConfig[] = [
  {
    label: 'ABAIXO DO PESO',
    subLabel: '< 18.5',
    color: '#0ea5e9',
    startAngle: 180,
    endAngle: 144,
    minImc: 15,
    maxImc: 18.5
  },
  {
    label: 'NORMAL',
    subLabel: '18.5 – 24.9',
    color: '#22c55e',
    startAngle: 144,
    endAngle: 108,
    minImc: 18.5,
    maxImc: 24.9
  },
  {
    label: 'SOBREPESO',
    subLabel: '25.0 – 29.9',
    color: '#eab308',
    startAngle: 108,
    endAngle: 72,
    minImc: 25.0,
    maxImc: 29.9
  },
  {
    label: 'OBESIDADE',
    subLabel: '30.0 – 39.9',
    color: '#f97316',
    startAngle: 72,
    endAngle: 36,
    minImc: 30.0,
    maxImc: 39.9
  },
  {
    label: 'OBESIDADE SEVERA',
    subLabel: '≥ 40.0',
    color: '#ef4444',
    startAngle: 36,
    endAngle: 0,
    minImc: 40.0,
    maxImc: 45.0
  }
]

function calculateNeedleAngle(imc: number): number {
  if (imc <= 15) return 176
  if (imc >= 45) return 4

  if (imc < 18.5) {
    const t = Math.max(0, (imc - 15) / (18.5 - 15))
    return 176 - t * (176 - 146)
  }
  if (imc < 25.0) {
    const t = (imc - 18.5) / (24.9 - 18.5)
    return 142 - t * (142 - 110)
  }
  if (imc < 30.0) {
    const t = (imc - 25.0) / (29.9 - 25.0)
    return 106 - t * (106 - 74)
  }
  if (imc < 40.0) {
    const t = (imc - 30.0) / (39.9 - 30.0)
    return 70 - t * (70 - 38)
  }
  const t = Math.min(1, (imc - 40.0) / (45.0 - 40.0))
  return 34 - t * (34 - 6)
}

export const ImcGaugeChart = ({
  imcResult,
  heightCm,
  currentWeight
}: ImcGaugeChartProps) => {
  if (!heightCm) {
    return (
      <Box
        p="lg"
        ta="center"
        style={{
          borderRadius: 12,
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed rgba(255, 255, 255, 0.1)'
        }}
      >
        <Text size="sm" c="dimmed">
          Cadastre sua altura no perfil para desbloquear o cálculo e gráfico de IMC.
        </Text>
      </Box>
    )
  }

  if (!currentWeight || !imcResult) {
    return (
      <Box
        p="lg"
        ta="center"
        style={{
          borderRadius: 12,
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed rgba(255, 255, 255, 0.1)'
        }}
      >
        <Text size="sm" c="dimmed">
          Faça um check-in de peso para calcular seu IMC e visualizar a classificação no medidor.
        </Text>
      </Box>
    )
  }

  const { imc, classification, minIdealWeight, maxIdealWeight } = imcResult

  const cx = 250
  const cy = 205
  const rOuter = 180
  const rInner = 110
  const rText = (rOuter + rInner) / 2
  const needleLength = 138
  const needleAngle = calculateNeedleAngle(imc)

  // Geometria da agulha
  const tip = polarToCartesian(cx, cy, needleLength, needleAngle)
  const baseR = 10
  const b1 = polarToCartesian(cx, cy, baseR, needleAngle + 90)
  const b2 = polarToCartesian(cx, cy, baseR, needleAngle - 90)
  const tail = polarToCartesian(cx, cy, 18, needleAngle + 180)
  const needlePath = `M ${tail.x.toFixed(2)} ${tail.y.toFixed(2)} L ${b1.x.toFixed(2)} ${b1.y.toFixed(2)} L ${tip.x.toFixed(2)} ${tip.y.toFixed(2)} L ${b2.x.toFixed(2)} ${b2.y.toFixed(2)} Z`

  return (
    <Box>
      {/* Título do Gráfico */}
      <Text
        ta="center"
        fw={800}
        size="12px"
        c="dimmed"
        mb={4}
        style={{ letterSpacing: '0.8px', textTransform: 'uppercase' }}
      >
        Índice de Massa Corporal (IMC)
      </Text>

      {/* SVG do Semicírculo com Arcos, Textos e Agulha */}
      <Box style={{ width: '100%', maxWidth: 440, margin: '0 auto', position: 'relative' }}>
        <svg
          viewBox="0 0 500 235"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          <defs>
            <filter id="gaugeShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.5" />
            </filter>
            <radialGradient id="pivotGrad" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
          </defs>

          {/* Fatias Coloridas com Divisórias */}
          {SECTORS.map((sector) => {
            const d = describeSector(cx, cy, rInner, rOuter, sector.startAngle, sector.endAngle)
            const midAngle = (sector.startAngle + sector.endAngle) / 2
            const pos = polarToCartesian(cx, cy, rText, midAngle)
            const rot = 90 - midAngle

            return (
              <g key={sector.label}>
                <path
                  d={d}
                  fill={sector.color}
                  stroke="#ffffff"
                  strokeWidth="1.8"
                />

                {/* Texto Rotacionado no Centro da Fatia */}
                <g transform={`translate(${pos.x}, ${pos.y}) rotate(${rot})`}>
                  <text
                    y={-5}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9.5"
                    fontWeight="800"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}
                  >
                    {sector.label}
                  </text>
                  <text
                    y={8}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="8.5"
                    fontWeight="600"
                    opacity={0.95}
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}
                  >
                    {sector.subLabel}
                  </text>
                </g>
              </g>
            )
          })}

          {/* Agulha Indicadora do IMC */}
          <path
            d={needlePath}
            fill="#1e293b"
            stroke="#ffffff"
            strokeWidth="1.2"
            filter="url(#gaugeShadow)"
          />

          {/* Linha de Destaque na Agulha */}
          <line
            x1={cx}
            y1={cy}
            x2={tip.x}
            y2={tip.y}
            stroke="#f8fafc"
            strokeWidth="1"
            strokeOpacity="0.8"
          />

          {/* Pivô Central da Agulha */}
          <circle
            cx={cx}
            cy={cy}
            r={15}
            fill="url(#pivotGrad)"
            stroke="#94a3b8"
            strokeWidth="2.5"
            filter="url(#gaugeShadow)"
          />
          <circle cx={cx} cy={cy} r={5} fill="#ffffff" />
        </svg>
      </Box>

      {/* Resumo do IMC do Usuário e Faixa Ideal */}
      <Group justify="space-between" align="center" mt={4} px="xs">
        <Group gap={8} align="center">
          <Text size="sm" fw={800} c="white">
            {imc.toFixed(1)} kg/m²
          </Text>
          <Badge
            color={
              classification.badgeVariant === 'success'
                ? 'teal'
                : classification.badgeVariant === 'warning'
                  ? 'yellow'
                  : classification.badgeVariant === 'danger'
                    ? 'red'
                    : 'blue'
            }
            variant="filled"
            size="sm"
            style={{ fontWeight: 700 }}
          >
            {classification.label}
          </Badge>
        </Group>

        <Text size="xs" c="dimmed">
          Faixa ideal: <span style={{ color: '#34d399', fontWeight: 600 }}>{minIdealWeight} – {maxIdealWeight} kg</span>
        </Text>
      </Group>
    </Box>
  )
}

export default ImcGaugeChart

