import { useState, useMemo } from 'react'
import { Group, Stack, Progress, Box, Badge as MantineBadge, Text } from '@mantine/core'
import { TbDropletFilled, TbPencil, TbTrophy } from 'react-icons/tb'

import Card from '@components/ui/card'
import ActionIcon from '@components/ui/actionIcon'
import useToastStore from '@stores/toast'
import { calculateDailyWaterGoal, getTodayDateString, formatDateDisplay } from '@stores/health/utils'
import { CompactBottleItem, AddBottleButton } from './compactBottleItem'
import EditWaterModal from './editWaterModal'

import type { CompactWaterCardProps } from './types'

export const CompactWaterCard = ({
  currentWeight,
  currentAge,
  currentHeight,
  consumedBottles,
  extraBottlesTarget,
  bottleMl = 500,
  selectedDate,
  onToggleBottle,
  onAddExtraBottle,
  onRemoveExtraBottle,
  onUpdateSettings
}: CompactWaterCardProps) => {
  const { showToast } = useToastStore()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const todayStr = getTodayDateString()
  const activeDate = selectedDate || todayStr
  const isViewingToday = activeDate === todayStr

  const { targetBottles, standardBottles } = useMemo(() => {
    return calculateDailyWaterGoal(
      currentWeight,
      extraBottlesTarget,
      bottleMl,
      undefined,
      currentAge,
      currentHeight
    )
  }, [currentWeight, extraBottlesTarget, bottleMl, currentAge, currentHeight])

  const totalConsumedMl = consumedBottles * bottleMl
  const standardMl = standardBottles * bottleMl
  const extraTargetMl = extraBottlesTarget * bottleMl
  const isGoalReached = totalConsumedMl >= standardMl && standardMl > 0
  const progressPercent = Math.min(100, Math.round((totalConsumedMl / standardMl) * 100))

  const handleBottleClick = (index: number) => {
    onToggleBottle(index)
    const nextConsumed = (consumedBottles === index + 1 ? index : index + 1) * bottleMl
    const dateLabel = isViewingToday ? 'hoje' : formatDateDisplay(activeDate)
    if (nextConsumed >= standardMl && totalConsumedMl < standardMl) {
      showToast(`🎉 Parabéns! Você bateu a meta de água (${dateLabel})!`, 'success')
    }
  }

  const handleAddExtra = () => {
    onAddExtraBottle()
    const dateLabel = isViewingToday ? 'hoje' : formatDateDisplay(activeDate)
    showToast(`+1 garrafa (${bottleMl}ml) adicionada à meta (${dateLabel})!`, 'info')
  }

  const handleRemoveExtra = () => {
    if (onRemoveExtraBottle) {
      onRemoveExtraBottle()
      const dateLabel = isViewingToday ? 'hoje' : formatDateDisplay(activeDate)
      showToast(`Garrafa extra removida da meta (${dateLabel})`, 'info')
    }
  }

  const handleSaveSettings = (settings: { bottleMl: number }) => {
    if (onUpdateSettings) {
      onUpdateSettings(settings)
      showToast('Tamanho da garrafa atualizado!', 'success')
    }
  }

  return (
    <>
      <Card style={{ padding: '10px 14px' }}>
        <Stack gap={8}>
          <Group justify="space-between" align="center" wrap="wrap" gap="xs">
            <Group gap={6} align="center" wrap="wrap">
              <TbDropletFilled size={15} color="#c084fc" />
              <Text size="xs" fw={700} c="white">
                Água
              </Text>
              <Text size="11px" c="dimmed">
                ({bottleMl}ml)
              </Text>
              <MantineBadge
                size="xs"
                variant={isViewingToday ? 'light' : 'gradient'}
                gradient={!isViewingToday ? { from: 'grape', to: 'violet' } : undefined}
                color={isViewingToday ? 'cyan' : undefined}
              >
                {isViewingToday ? 'Hoje' : formatDateDisplay(activeDate)}
              </MantineBadge>
            </Group>

            <Group gap={6} align="center" wrap="wrap">
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
                  {totalConsumedMl}ml / {standardMl}ml ({progressPercent}%)
                </Text>
              )}

              {extraBottlesTarget > 0 && (
                <Text size="11px" c="#c084fc" fw={700}>
                  (+{extraTargetMl}ml extra)
                </Text>
              )}

              {onUpdateSettings && (
                <ActionIcon
                  variant="subtle"
                  size="xs"
                  onClick={() => setIsEditModalOpen(true)}
                  title="Configurar tamanho da garrafa"
                  style={{ width: 20, height: 20 }}
                >
                  <TbPencil size={12} />
                </ActionIcon>
              )}
            </Group>
          </Group>

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
                  bottleMl={bottleMl}
                  onClick={() => handleBottleClick(index)}
                  onRemove={isExtra ? handleRemoveExtra : undefined}
                />
              )
            })}

            <AddBottleButton bottleMl={bottleMl} onClick={handleAddExtra} />
          </Box>
        </Stack>
      </Card>

      <EditWaterModal
        opened={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentWeight={currentWeight}
        currentAge={currentAge}
        currentHeight={currentHeight}
        currentBottleMl={bottleMl}
        onSave={handleSaveSettings}
      />
    </>
  )
}

export default CompactWaterCard
