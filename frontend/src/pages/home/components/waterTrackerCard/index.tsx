import { useMemo } from 'react'
import {
  Stack,
  Group,
  Text,
  Progress,
  Box,
  Badge as MantineBadge,
  ThemeIcon
} from '@mantine/core'
import {
  TbDropletFilled,
  TbPlus,
  TbRotateClockwise2,
  TbTrophy
} from 'react-icons/tb'

import Card, { CardHeader, CardTitle, CardContent } from '@components/ui/card'
import Button from '@components/ui/button'
import useToastStore from '@stores/toast'
import { calculateDailyWaterGoal, getTodayDateString, formatDateDisplay } from '@stores/health/utils'
import { CompactBottleItem, AddBottleButton } from '@pages/habits/components/compactWaterCard/compactBottleItem'
import type { WaterTrackerCardProps } from './types'

export const WaterTrackerCard = ({
  currentWeight,
  consumedBottles,
  extraBottlesTarget,
  onToggleBottle,
  onAddExtraBottle,
  onResetToday
}: WaterTrackerCardProps) => {
  const { showToast } = useToastStore()
  const todayStr = getTodayDateString()

  // Meta calculada com base no peso (35ml/kg)
  const { targetMl, targetBottles, standardBottles } = useMemo(() => {
    return calculateDailyWaterGoal(currentWeight, extraBottlesTarget)
  }, [currentWeight, extraBottlesTarget])

  const totalConsumedMl = consumedBottles * 500
  const progressPercent = Math.min(100, Math.round((totalConsumedMl / targetMl) * 100))
  const isGoalReached = totalConsumedMl >= targetMl && targetMl > 0

  const handleBottleClick = (index: number) => {
    onToggleBottle(index)
    const nextConsumed = (consumedBottles === index + 1 ? index : index + 1) * 500
    if (nextConsumed >= targetMl && totalConsumedMl < targetMl) {
      showToast('🎉 Parabéns! Você bateu sua meta diária de hidratação!', 'success')
    }
  }

  const handleAddExtra = () => {
    onAddExtraBottle()
    showToast('+1 garrafa (500ml) adicionada à sua meta de hoje!', 'info')
  }

  return (
    <Card style={{ position: 'relative', overflow: 'hidden' }}>
      <CardHeader>
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap={8} align="center">
            <ThemeIcon
              size="sm"
              radius="md"
              variant="light"
              color="cyan"
              style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)' }}
            >
              <TbDropletFilled size={16} color="#38bdf8" />
            </ThemeIcon>
            <CardTitle style={{ fontSize: '15px', fontWeight: 700 }}>Hidratação Diária</CardTitle>
            <MantineBadge size="xs" variant="outline" color="cyan">
              {formatDateDisplay(todayStr)}
            </MantineBadge>
          </Group>

          <Group gap={6} align="center">
            {isGoalReached ? (
              <MantineBadge
                variant="gradient"
                gradient={{ from: 'cyan', to: 'blue' }}
                size="xs"
                leftSection={<TbTrophy size={12} />}
              >
                Meta Atingida!
              </MantineBadge>
            ) : (
              <MantineBadge variant="light" color="cyan" size="xs">
                {progressPercent}% concluído
              </MantineBadge>
            )}
          </Group>
        </Group>
      </CardHeader>

      <CardContent>
        <Stack gap="md">
          {/* Barra de Progresso e Métricas Numéricas Minimalistas */}
          <Box
            style={{
              borderRadius: 10,
              background: 'rgba(56, 189, 248, 0.04)',
              border: '1px solid rgba(56, 189, 248, 0.15)',
              padding: '12px 14px'
            }}
          >
            <Group justify="space-between" align="baseline" mb={8}>
              <Group align="baseline" gap={6}>
                <Text size="20px" fw={800} c="#38bdf8" style={{ lineHeight: 1 }}>
                  {totalConsumedMl.toLocaleString('pt-BR')}
                </Text>
                <Text size="xs" c="dimmed">
                  / {targetMl.toLocaleString('pt-BR')} ml
                </Text>
              </Group>

              <Text size="xs" c="dimmed">
                <span style={{ color: '#fff', fontWeight: 700 }}>{consumedBottles}</span> de{' '}
                <span style={{ color: '#fff', fontWeight: 700 }}>{targetBottles}</span> garrafas (500ml)
              </Text>
            </Group>

            <Progress
              value={progressPercent}
              size="xs"
              radius="xl"
              color="cyan"
              animated={false}
              styles={{
                root: {
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  height: 5
                },
                section: {
                  background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)'
                }
              }}
            />
          </Box>

          {/* Garrafinhas Interativas Compactas */}
          <Box>
            <Group justify="space-between" align="center" mb={8}>
              <Text size="xs" fw={600} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Garrafas do Dia
              </Text>
              <Text size="11px" c="dimmed">
                Clique para marcar consumo
              </Text>
            </Group>

            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                overflowX: 'auto',
                padding: '4px 0',
                scrollbarWidth: 'none'
              }}
            >
              {Array.from({ length: targetBottles }).map((_, index) => {
                const isExtra = index >= standardBottles
                return (
                  <CompactBottleItem
                    key={index}
                    index={index}
                    isFilled={index < consumedBottles}
                    isExtra={isExtra}
                    bottleMl={500}
                    onClick={() => handleBottleClick(index)}
                  />
                )
              })}

              <AddBottleButton bottleMl={500} onClick={handleAddExtra} />
            </Box>
          </Box>

          {/* Ações Rápidas no Rodapé */}
          <Group justify="space-between" align="center" pt={4} wrap="wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddExtra}
              leftIcon={<TbPlus size={14} />}
            >
              +1 Garrafa (500ml)
            </Button>

            {consumedBottles > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetToday}
                leftIcon={<TbRotateClockwise2 size={13} />}
              >
                Zerar Hoje
              </Button>
            )}
          </Group>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default WaterTrackerCard
