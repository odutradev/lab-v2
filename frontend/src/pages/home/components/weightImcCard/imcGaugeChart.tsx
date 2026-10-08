import { Box, Group, Text, Badge, Stack, Button as MantineButton } from '@mantine/core'
import { TbHeartbeat, TbRuler } from 'react-icons/tb'
import type { ImcGaugeChartProps } from './types'

export const ImcGaugeChart = ({
  imcResult,
  heightCm,
  currentWeight,
  onConfigureHeight
}: ImcGaugeChartProps) => {
  if (!heightCm) {
    return (
      <Box
        p="md"
        ta="center"
        style={{
          borderRadius: 12,
          background: 'rgba(99, 102, 241, 0.05)',
          border: '1px dashed rgba(99, 102, 241, 0.25)'
        }}
      >
        <Text size="sm" c="dimmed">
          Altura não cadastrada
        </Text>
        <Text size="xs" c="dimmed" mt={4} mb="xs">
          Defina sua altura no personagem para desbloquear o cálculo e gráfico real de IMC.
        </Text>
        {onConfigureHeight && (
          <MantineButton
            size="xs"
            variant="light"
            color="indigo"
            leftSection={<TbRuler size={14} />}
            onClick={onConfigureHeight}
          >
            Cadastrar Altura
          </MantineButton>
        )}
      </Box>
    )
  }

  if (!currentWeight || !imcResult) {
    return (
      <Box
        p="md"
        ta="center"
        style={{
          borderRadius: 12,
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed rgba(255, 255, 255, 0.1)'
        }}
      >
        <Text size="sm" c="dimmed">
          Aguardando registro de peso
        </Text>
        <Text size="xs" c="dimmed" mt={4}>
          Registre seu peso para visualizar sua classificação e posição no gráfico de IMC.
        </Text>
      </Box>
    )
  }

  const { imc, classification, minIdealWeight, maxIdealWeight, positionPercent } = imcResult

  return (
    <Box>
      <Group justify="space-between" align="flex-start" mb="xs">
        <Group gap="xs" align="center">
          <TbHeartbeat size={18} color="#818cf8" />
          <Text size="xs" fw={600} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Índice de Massa Corporal (OMS)
          </Text>
        </Group>

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
          size="md"
        >
          {classification.label}
        </Badge>
      </Group>

      {/* Destaque do número e peso ideal */}
      <Group justify="space-between" align="baseline" mb="sm">
        <Group align="baseline" gap="xs">
          <Text size="26px" fw={800} c="white" style={{ lineHeight: 1 }}>
            {imc.toFixed(1)}
          </Text>
          <Text size="xs" c="dimmed">
            kg/m²
          </Text>
        </Group>

        <Text size="xs" c="dimmed">
          Faixa ideal: <span style={{ color: '#34d399', fontWeight: 600 }}>{minIdealWeight}kg - {maxIdealWeight}kg</span>
        </Text>
      </Group>

      {/* Gráfico de barras minimalista com classificação real da OMS */}
      <Box mb="xs">
        {/* Marcador do usuário */}
        <Box
          style={{
            position: 'relative',
            height: 18,
            marginBottom: 2
          }}
        >
          <Box
            style={{
              position: 'absolute',
              left: `${positionPercent}%`,
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'left 0.4s ease'
            }}
          >
            <Text size="10px" fw={700} c="white" style={{ lineHeight: 1 }}>
              ▼
            </Text>
          </Box>
        </Box>

        {/* Barra de espectro de IMC */}
        <Box
          style={{
            height: 10,
            borderRadius: 6,
            display: 'flex',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            background: '#1e293b'
          }}
        >
          {/* Abaixo: 15 a 18.5 (14%) */}
          <Box
            style={{
              width: '14%',
              background: '#38bdf8',
              opacity: classification.key === 'underweight' ? 1 : 0.65
            }}
            title="Abaixo do peso (< 18.5)"
          />
          {/* Peso Saudável: 18.5 a 24.9 (25.6%) */}
          <Box
            style={{
              width: '26%',
              background: '#10b981',
              opacity: classification.key === 'normal' ? 1 : 0.65
            }}
            title="Peso Saudável (18.5 - 24.9)"
          />
          {/* Sobrepeso: 25 a 29.9 (20%) */}
          <Box
            style={{
              width: '20%',
              background: '#f59e0b',
              opacity: classification.key === 'overweight' ? 1 : 0.65
            }}
            title="Sobrepeso (25.0 - 29.9)"
          />
          {/* Obesidade Grau 1: 30 a 34.9 (20%) */}
          <Box
            style={{
              width: '20%',
              background: '#f97316',
              opacity: classification.key === 'obesity1' ? 1 : 0.65
            }}
            title="Obesidade Grau I (30.0 - 34.9)"
          />
          {/* Obesidade Severa: 35+ (20%) */}
          <Box
            style={{
              width: '20%',
              background: '#ef4444',
              opacity: classification.key === 'obesity2' ? 1 : 0.65
            }}
            title="Obesidade Grau II / III (≥ 35.0)"
          />
        </Box>

        {/* Legenda minimalista */}
        <Group justify="space-between" mt={6} gap={2}>
          <Text size="10px" c="#38bdf8" fw={500}>
            Abaixo (&lt;18.5)
          </Text>
          <Text size="10px" c="#10b981" fw={600}>
            Saudável (18.5-24.9)
          </Text>
          <Text size="10px" c="#f59e0b" fw={500}>
            Sobrepeso (25-29.9)
          </Text>
          <Text size="10px" c="#ef4444" fw={500}>
            Obeso (≥30)
          </Text>
        </Group>
      </Box>

      {/* Descrição clínica breve */}
      <Stack gap={2} mt="xs">
        <Text size="xs" c="dimmed">
          {classification.description}
        </Text>
      </Stack>
    </Box>
  )
}

export default ImcGaugeChart
