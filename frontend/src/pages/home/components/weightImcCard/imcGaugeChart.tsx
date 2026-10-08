import { Box, Group, Text, Badge } from '@mantine/core'
import { TbHeartbeat } from 'react-icons/tb'
import type { ImcGaugeChartProps } from './types'

export const ImcGaugeChart = ({
  imcResult,
  heightCm,
  currentWeight
}: ImcGaugeChartProps) => {
  if (!heightCm) {
    return (
      <Box
        p="xs"
        ta="center"
        style={{
          borderRadius: 8,
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed rgba(255, 255, 255, 0.08)'
        }}
      >
        <Text size="11px" c="dimmed">
          Cadastre sua altura no perfil para desbloquear o cálculo de IMC.
        </Text>
      </Box>
    )
  }

  if (!currentWeight || !imcResult) {
    return (
      <Box
        p="xs"
        ta="center"
        style={{
          borderRadius: 8,
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed rgba(255, 255, 255, 0.08)'
        }}
      >
        <Text size="11px" c="dimmed">
          Faça seu check-in de peso para calcular seu IMC e classificação corporal.
        </Text>
      </Box>
    )
  }

  const { imc, classification, minIdealWeight, maxIdealWeight, positionPercent } = imcResult

  return (
    <Box>
      <Group justify="space-between" align="center" mb={6}>
        <Group gap={6} align="center">
          <TbHeartbeat size={15} color="#818cf8" />
          <Text size="xs" fw={600} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Índice de Massa Corporal
          </Text>
        </Group>

        <Group gap={6} align="center">
          <Text size="xs" fw={700} c="white">
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
            variant="light"
            size="xs"
          >
            {classification.label}
          </Badge>
        </Group>
      </Group>

      {/* Barra de espectro de IMC minimalista de 4px */}
      <Box style={{ position: 'relative', margin: '6px 0 4px 0' }}>
        {/* Marcador do usuário */}
        <Box
          style={{
            position: 'absolute',
            left: `${positionPercent}%`,
            top: -6,
            transform: 'translateX(-50%)',
            width: 3,
            height: 16,
            backgroundColor: '#ffffff',
            borderRadius: 2,
            boxShadow: '0 0 6px rgba(255, 255, 255, 0.9)',
            zIndex: 2,
            transition: 'left 0.3s ease'
          }}
        />

        <Box
          style={{
            height: 5,
            borderRadius: 4,
            display: 'flex',
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.06)'
          }}
        >
          <Box style={{ width: '14%', background: '#38bdf8' }} title="Abaixo do peso (< 18.5)" />
          <Box style={{ width: '26%', background: '#10b981' }} title="Saudável (18.5 - 24.9)" />
          <Box style={{ width: '20%', background: '#f59e0b' }} title="Sobrepeso (25.0 - 29.9)" />
          <Box style={{ width: '20%', background: '#f97316' }} title="Obesidade I (30.0 - 34.9)" />
          <Box style={{ width: '20%', background: '#ef4444' }} title="Obesidade II/III (≥ 35.0)" />
        </Box>
      </Box>

      {/* Legenda compacta e faixa ideal */}
      <Group justify="space-between" align="center" mt={4}>
        <Group gap={8}>
          <Text size="10px" c="#38bdf8">Abaixo</Text>
          <Text size="10px" c="#10b981" fw={600}>Normal</Text>
          <Text size="10px" c="#f59e0b">Sobrepeso</Text>
          <Text size="10px" c="#ef4444">Obeso</Text>
        </Group>

        <Text size="10px" c="dimmed">
          Faixa ideal: <span style={{ color: '#34d399', fontWeight: 600 }}>{minIdealWeight} - {maxIdealWeight} kg</span>
        </Text>
      </Group>
    </Box>
  )
}

export default ImcGaugeChart
