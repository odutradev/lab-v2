import { Box, Group, Stack, Text, Badge } from '@mantine/core'
import type { ImcGaugeChartProps } from './types'

interface ClassificationBand {
  label: string
  range: string
  color: string
  bgActive: string
  borderActive: string
  widthPercent: number
}

const BANDS: ClassificationBand[] = [
  {
    label: 'Abaixo',
    range: '< 18.5',
    color: '#38bdf8',
    bgActive: 'rgba(56, 189, 248, 0.12)',
    borderActive: 'rgba(56, 189, 248, 0.45)',
    widthPercent: 15
  },
  {
    label: 'Normal',
    range: '18.5 – 24.9',
    color: '#10b981',
    bgActive: 'rgba(16, 185, 129, 0.12)',
    borderActive: 'rgba(16, 185, 129, 0.45)',
    widthPercent: 30
  },
  {
    label: 'Sobrepeso',
    range: '25.0 – 29.9',
    color: '#f59e0b',
    bgActive: 'rgba(245, 158, 11, 0.12)',
    borderActive: 'rgba(245, 158, 11, 0.45)',
    widthPercent: 25
  },
  {
    label: 'Obesidade',
    range: '30.0 – 39.9',
    color: '#f97316',
    bgActive: 'rgba(249, 115, 22, 0.12)',
    borderActive: 'rgba(249, 115, 22, 0.45)',
    widthPercent: 15
  },
  {
    label: 'Severa',
    range: '≥ 40.0',
    color: '#ef4444',
    bgActive: 'rgba(239, 68, 68, 0.12)',
    borderActive: 'rgba(239, 68, 68, 0.45)',
    widthPercent: 15
  }
]

function getActiveBandIndex(imc: number): number {
  if (imc < 18.5) return 0
  if (imc < 25.0) return 1
  if (imc < 30.0) return 2
  if (imc < 40.0) return 3
  return 4
}

function calculateMarkerPercent(imc: number): number {
  if (imc <= 15) return 0
  if (imc >= 45) return 100

  if (imc < 18.5) {
    const t = (imc - 15) / (18.5 - 15)
    return Math.max(0, Math.min(15, t * 15))
  }
  if (imc < 25.0) {
    const t = (imc - 18.5) / (25.0 - 18.5)
    return 15 + t * 30
  }
  if (imc < 30.0) {
    const t = (imc - 25.0) / (30.0 - 25.0)
    return 45 + t * 25
  }
  if (imc < 40.0) {
    const t = (imc - 30.0) / (40.0 - 30.0)
    return 70 + t * 15
  }
  const t = Math.min(1, (imc - 40.0) / (45.0 - 40.0))
  return 85 + t * 15
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
          Faça um check-in de peso para calcular seu IMC e visualizar sua classificação.
        </Text>
      </Box>
    )
  }

  const { imc, classification, minIdealWeight, maxIdealWeight } = imcResult
  const activeIndex = getActiveBandIndex(imc)
  const markerPercent = calculateMarkerPercent(imc)
  const activeColor = BANDS[activeIndex]?.color || '#10b981'

  return (
    <Box
      p="sm"
      style={{
        borderRadius: 12,
        background: 'rgba(255, 255, 255, 0.015)',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}
    >
      <Stack gap="md">
        {/* Topo: Valor do IMC em destaque + Metadados */}
        <Group justify="space-between" align="flex-end" wrap="nowrap">
          <Group gap="sm" align="center">
            <Text
              fw={800}
              c="white"
              style={{ fontSize: 28, lineHeight: 1, letterSpacing: '-0.5px' }}
            >
              {imc.toFixed(1)}
            </Text>
            <Stack gap={2}>
              <Text size="11px" fw={600} c="dimmed" style={{ lineHeight: 1 }}>
                kg/m²
              </Text>
              <Badge
                variant="filled"
                size="sm"
                style={{
                  backgroundColor: activeColor,
                  fontWeight: 700,
                  fontSize: '11px',
                  height: 20
                }}
              >
                {classification.label}
              </Badge>
            </Stack>
          </Group>

          <Stack gap={2} align="flex-end">
            <Group gap={4}>
              <Text size="xs" c="dimmed">
                Peso:
              </Text>
              <Text size="xs" fw={700} c="white">
                {currentWeight.toFixed(1)} kg
              </Text>
            </Group>
            <Group gap={4}>
              <Text size="xs" c="dimmed">
                Faixa ideal:
              </Text>
              <Text size="xs" fw={700} c="#34d399">
                {minIdealWeight} – {maxIdealWeight} kg
              </Text>
            </Group>
          </Stack>
        </Group>

        {/* Barra Retangular Minimalista de Espectro com Marcador */}
        <Box style={{ position: 'relative', paddingTop: 8, paddingBottom: 6 }}>
          {/* Marcador Indicador do Usuário */}
          <Box
            style={{
              position: 'absolute',
              left: `${markerPercent}%`,
              top: 0,
              transform: 'translateX(-50%)',
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pointerEvents: 'none'
            }}
          >
            {/* Triângulo indicador apontando para a barra */}
            <Box
              style={{
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '6px solid #ffffff'
              }}
            />
            {/* Linha vertical que atravessa a barra */}
            <Box
              style={{
                width: 3,
                height: 18,
                backgroundColor: '#ffffff',
                borderRadius: 2,
                boxShadow: '0 0 8px rgba(255, 255, 255, 0.9), 0 2px 4px rgba(0, 0, 0, 0.5)'
              }}
            />
          </Box>

          {/* Barra contínua com as 5 seções coloridas */}
          <Box
            style={{
              height: 10,
              borderRadius: 6,
              display: 'flex',
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            {BANDS.map((b) => (
              <Box
                key={b.label}
                style={{
                  width: `${b.widthPercent}%`,
                  backgroundColor: b.color,
                  opacity: 0.9,
                  transition: 'opacity 0.2s'
                }}
                title={`${b.label}: ${b.range}`}
              />
            ))}
          </Box>
        </Box>

        {/* Grid Retangular das 5 Classificações */}
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
                p={6}
                ta="center"
                style={{
                  borderRadius: 8,
                  backgroundColor: isCurrent ? b.bgActive : 'rgba(255, 255, 255, 0.02)',
                  border: isCurrent
                    ? `1px solid ${b.borderActive}`
                    : '1px solid rgba(255, 255, 255, 0.04)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Indicador de cor no topo do cartão */}
                <Box
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2.5,
                    backgroundColor: b.color,
                    opacity: isCurrent ? 1 : 0.4
                  }}
                />

                <Text
                  size="11px"
                  fw={isCurrent ? 800 : 600}
                  c={isCurrent ? '#ffffff' : 'dimmed'}
                  style={{ lineHeight: 1.2, marginTop: 2 }}
                >
                  {b.label}
                </Text>
                <Text
                  size="9.5px"
                  fw={isCurrent ? 700 : 500}
                  c={isCurrent ? b.color : 'dimmed'}
                  style={{ lineHeight: 1.2, marginTop: 2 }}
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


