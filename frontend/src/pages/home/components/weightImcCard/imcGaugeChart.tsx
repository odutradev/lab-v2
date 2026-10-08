import { Box, Group, Stack, Text, Badge } from '@mantine/core'
import type { ImcGaugeChartProps } from './types'

interface ClassificationBand {
  label: string
  range: string
  color: string
}

const BANDS: ClassificationBand[] = [
  {
    label: 'Abaixo',
    range: '< 18.5',
    color: '#38bdf8'
  },
  {
    label: 'Normal',
    range: '18.5 – 24.9',
    color: '#10b981'
  },
  {
    label: 'Sobrepeso',
    range: '25.0 – 29.9',
    color: '#f59e0b'
  },
  {
    label: 'Obesidade',
    range: '30.0 – 39.9',
    color: '#f97316'
  },
  {
    label: 'Severa',
    range: '≥ 40.0',
    color: '#ef4444'
  }
]

function getActiveBandIndex(imc: number): number {
  if (imc < 18.5) return 0
  if (imc < 25.0) return 1
  if (imc < 30.0) return 2
  if (imc < 40.0) return 3
  return 4
}

export const ImcGaugeChart = ({
  imcResult,
  heightCm,
  currentWeight
}: ImcGaugeChartProps) => {
  if (!heightCm) {
    return (
      <Box
        p="md"
        ta="center"
        style={{
          borderRadius: 8,
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed rgba(255, 255, 255, 0.08)'
        }}
      >
        <Text size="xs" c="dimmed">
          Cadastre sua altura no perfil para calcular seu IMC.
        </Text>
      </Box>
    )
  }

  if (!currentWeight || !imcResult) {
    return (
      <Box
        p="md"
        ta="center"
        style={{
          borderRadius: 8,
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed rgba(255, 255, 255, 0.08)'
        }}
      >
        <Text size="xs" c="dimmed">
          Faça um check-in de peso para calcular seu IMC.
        </Text>
      </Box>
    )
  }

  const { imc, classification, minIdealWeight, maxIdealWeight } = imcResult
  const activeIndex = getActiveBandIndex(imc)
  const activeColor = BANDS[activeIndex]?.color || '#10b981'

  return (
    <Box
      p="md"
      style={{
        borderRadius: 10,
        background: 'rgba(255, 255, 255, 0.015)',
        border: '1px solid rgba(255, 255, 255, 0.06)'
      }}
    >
      <Stack gap="md">
        {/* Topo em linha única sem qualquer sobreposição */}
        <Group justify="space-between" align="center" wrap="wrap">
          <Group gap="xs" align="center">
            <Text fw={800} size="24px" c="white" style={{ lineHeight: 1 }}>
              {imc.toFixed(1)}
            </Text>
            <Text size="xs" fw={600} c="dimmed">
              kg/m²
            </Text>
            <Badge
              variant="light"
              size="sm"
              radius="sm"
              style={{
                backgroundColor: `${activeColor}22`,
                color: activeColor,
                border: `1px solid ${activeColor}55`,
                fontWeight: 700
              }}
            >
              {classification.label}
            </Badge>
          </Group>

          <Group gap="md" align="center">
            <Text size="xs" c="dimmed">
              Peso: <span style={{ color: '#fff', fontWeight: 600 }}>{currentWeight.toFixed(1)} kg</span>
            </Text>
            <Text size="xs" c="dimmed">
              Faixa ideal: <span style={{ color: '#10b981', fontWeight: 600 }}>{minIdealWeight} – {maxIdealWeight} kg</span>
            </Text>
          </Group>
        </Group>

        {/* Barra segmentada limpa sem marcadores sobrepostos */}
        <Group gap={4} grow wrap="nowrap">
          {BANDS.map((b, idx) => {
            const isCurrent = idx === activeIndex
            return (
              <Box
                key={b.label}
                style={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: b.color,
                  opacity: isCurrent ? 1 : 0.25,
                  boxShadow: isCurrent ? `0 0 8px ${b.color}88` : 'none',
                  transition: 'opacity 0.2s ease'
                }}
              />
            )
          })}
        </Group>

        {/* 5 Blocos retangulares de classificação */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 6
          }}
        >
          {BANDS.map((b, idx) => {
            const isCurrent = idx === activeIndex

            return (
              <Box
                key={b.label}
                p="xs"
                ta="center"
                style={{
                  borderRadius: 8,
                  backgroundColor: isCurrent ? `${b.color}15` : 'rgba(255, 255, 255, 0.02)',
                  border: isCurrent
                    ? `1px solid ${b.color}88`
                    : '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Text
                  size="11px"
                  fw={isCurrent ? 700 : 500}
                  c={isCurrent ? b.color : 'dimmed'}
                  style={{ lineHeight: 1.3 }}
                >
                  {b.label}
                </Text>
                <Text
                  size="10px"
                  fw={isCurrent ? 600 : 400}
                  c={isCurrent ? '#ffffff' : 'dimmed'}
                  style={{ lineHeight: 1.3, marginTop: 2 }}
                >
                  {b.range}
                </Text>
              </Box>
            )
          })}
        </Box>
      </Stack>
    </Box>
  )
}

export default ImcGaugeChart


