import { useMemo } from 'react'
import { Group, Stack, Progress, Box, Badge as MantineBadge, Text } from '@mantine/core'
import { TbDropletFilled, TbRotateClockwise2, TbTrophy } from 'react-icons/tb'

import Card from '@components/ui/card'
import ActionIcon from '@components/ui/actionIcon'
import useToastStore from '@stores/toast'
import { calculateDailyWaterGoal } from '@stores/health/utils'
import { CompactBottleItem, AddBottleButton } from './compactBottleItem'

interface CompactWaterCardProps {
  currentWeight?: number
  consumedBottles: number
  extraBottlesTarget: number
  onToggleBottle: (index: number) => void
  onAddExtraBottle: () => void
  onRemoveExtraBottle?: () => void
  onResetToday: () => void
}

export const CompactWaterCard = ({
  currentWeight,
  consumedBottles,
  extraBottlesTarget,
  onToggleBottle,
  onAddExtraBottle,
  onRemoveExtraBottle,
  onResetToday
}: CompactWaterCardProps) => {
  const { showToast } = useToastStore()

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
      showToast('🎉 Parabéns! Você bateu a meta de água do dia!', 'success')
    }
  }

  const handleAddExtra = () => {
    onAddExtraBottle()
    showToast('+1 garrafa (500ml) adicionada à meta!', 'info')
  }

  const handleRemoveExtra = () => {
    if (onRemoveExtraBottle) {
      onRemoveExtraBottle()
      showToast('Garrafa extra removida da meta', 'info')
    }
  }

  return (
    <Card style={{ padding: '10px 14px' }}>
      <Stack gap={8}>
        {/* Cabeçalho Minimalista e Compacto */}
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap={6} align="center">
            <TbDropletFilled size={15} color="#c084fc" />
            <Text size="xs" fw={700} c="white">
              Água
            </Text>
            <Text size="11px" c="dimmed">
              (500ml)
            </Text>
          </Group>

          <Group gap={6} align="center">
            {isGoalReached ? (
              <MantineBadge
                variant="gradient"
                gradient={{ from: 'grape', to: 'violet' }}
                size="xs"
                leftSection={<TbTrophy size={10} />}
                styles={{ root: { height: 18, padding: '0 6px', fontSize: 10 } }}
              >
                Meta Atingida!
              </MantineBadge>
            ) : (
              <Text size="11px" c="dimmed" fw={600}>
                {totalConsumedMl}ml / {targetMl}ml ({progressPercent}%)
              </Text>
            )}

            {consumedBottles > 0 && (
              <ActionIcon
                variant="subtle"
                size="xs"
                onClick={onResetToday}
                title="Zerar garrafas de hoje"
                style={{ width: 20, height: 20 }}
              >
                <TbRotateClockwise2 size={12} />
              </ActionIcon>
            )}
          </Group>
        </Group>

        {/* Barra de Progresso / Slider Fino no Topo (Sem Nenhuma Animação) */}
        <Progress
          value={progressPercent}
          size="xs"
          radius="xl"
          color="grape"
          animated={false}
          styles={{
            root: {
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              height: 4
            },
            section: {
              background: 'linear-gradient(90deg, #9333ea 0%, #c084fc 100%)',
              transition: 'none'
            }
          }}
        />

        {/* Lista Horizontal de Garrafas Pequenas + Botão Adicionar no Final */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            overflowX: 'auto',
            padding: '2px 0',
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
                onClick={() => handleBottleClick(index)}
                onRemove={isExtra ? handleRemoveExtra : undefined}
              />
            )
          })}

          {/* Garrafa com ícone de adicionar no final */}
          <AddBottleButton onClick={handleAddExtra} />
        </Box>
      </Stack>
    </Card>
  )
}

export default CompactWaterCard
