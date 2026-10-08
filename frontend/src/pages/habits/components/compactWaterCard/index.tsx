import { useMemo } from 'react'
import { Group, Stack, Progress, Box, Badge as MantineBadge } from '@mantine/core'
import { TbDropletFilled, TbPlus, TbRotateClockwise2, TbTrophy } from 'react-icons/tb'

import Card, { CardHeader, CardTitle, CardContent } from '@components/ui/card'
import ActionIcon from '@components/ui/actionIcon'
import useToastStore from '@stores/toast'
import { calculateDailyWaterGoal } from '@stores/health/utils'
import { WaterBottleItem } from '@pages/home/components/waterTrackerCard/waterBottleItem'

interface CompactWaterCardProps {
  currentWeight?: number
  consumedBottles: number
  extraBottlesTarget: number
  onToggleBottle: (index: number) => void
  onAddExtraBottle: () => void
  onResetToday: () => void
}

export const CompactWaterCard = ({
  currentWeight,
  consumedBottles,
  extraBottlesTarget,
  onToggleBottle,
  onAddExtraBottle,
  onResetToday
}: CompactWaterCardProps) => {
  const { showToast } = useToastStore()

  const { targetMl, targetBottles } = useMemo(() => {
    return calculateDailyWaterGoal(currentWeight, extraBottlesTarget)
  }, [currentWeight, extraBottlesTarget])

  const totalConsumedMl = consumedBottles * 500
  const progressPercent = Math.min(100, Math.round((totalConsumedMl / targetMl) * 100))
  const isGoalReached = totalConsumedMl >= targetMl && targetMl > 0

  const handleBottleClick = (index: number) => {
    onToggleBottle(index)
    const nextConsumed = (consumedBottles === index + 1 ? index : index + 1) * 500
    if (nextConsumed >= targetMl && totalConsumedMl < targetMl) {
      showToast('🎉 Parabéns! Você bateu a meta de água do dia!', 'success')
    }
  }

  const handleAddExtra = () => {
    onAddExtraBottle()
    showToast('+1 garrafa (500ml) adicionada à meta!', 'info')
  }

  return (
    <Card style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Glow suave no topo */}
      <Box
        style={{
          position: 'absolute',
          top: -24,
          right: -24,
          width: 100,
          height: 100,
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <CardHeader style={{ paddingBottom: 6 }}>
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap={6} align="center">
            <TbDropletFilled size={18} color="#c084fc" />
            <CardTitle style={{ fontSize: '14px', fontWeight: 700 }}>Água (500ml)</CardTitle>
          </Group>

          <Group gap={6}>
            {isGoalReached ? (
              <MantineBadge
                variant="gradient"
                gradient={{ from: 'grape', to: 'violet' }}
                size="xs"
                leftSection={<TbTrophy size={11} />}
              >
                Meta Atingida!
              </MantineBadge>
            ) : (
              <MantineBadge variant="light" color="grape" size="xs">
                {progressPercent}% ({totalConsumedMl}ml)
              </MantineBadge>
            )}

            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={handleAddExtra}
              title="Adicionar +1 garrafa de 500ml"
            >
              <TbPlus size={14} />
            </ActionIcon>

            {consumedBottles > 0 && (
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={onResetToday}
                title="Zerar garrafas de hoje"
              >
                <TbRotateClockwise2 size={13} />
              </ActionIcon>
            )}
          </Group>
        </Group>
      </CardHeader>

      <CardContent style={{ paddingTop: 0 }}>
        <Stack gap={8}>
          {/* Barra de Progresso Compacta */}
          <Progress
            value={progressPercent}
            size="sm"
            radius="xl"
            color="grape"
            animated={progressPercent < 100 && progressPercent > 0}
            styles={{
              root: {
                backgroundColor: 'rgba(255, 255, 255, 0.06)'
              },
              section: {
                background: 'linear-gradient(90deg, #9333ea 0%, #c084fc 100%)',
                boxShadow: '0 0 10px rgba(192, 132, 252, 0.4)'
              }
            }}
          />

          {/* Garrafinhas Interativas em Grid Compacto */}
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              overflowX: 'auto',
              padding: '2px 0'
            }}
          >
            {Array.from({ length: targetBottles }).map((_, index) => (
              <Box key={index} style={{ flexShrink: 0 }}>
                <WaterBottleItem
                  index={index}
                  isFilled={index < consumedBottles}
                  onClick={() => handleBottleClick(index)}
                />
              </Box>
            ))}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default CompactWaterCard
