import { useMemo } from 'react'
import {
  Stack,
  Group,
  Text,
  Progress,
  Box,
  Badge,
  SimpleGrid
} from '@mantine/core'
import {
  TbDropletFilled,
  TbPlus,
  TbRotateClockwise2,
  TbTrophy,
  TbInfoCircle
} from 'react-icons/tb'

import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@components/ui/card'
import Button from '@components/ui/button'
import useToastStore from '@stores/toast'
import { calculateDailyWaterGoal } from '@stores/health/utils'
import { WaterBottleItem } from './waterBottleItem'
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

  // Meta calculada com base no peso (35ml/kg)
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
      showToast('🎉 Parabéns! Você bateu sua meta diária de hidratação!', 'success')
    }
  }

  const handleAddExtra = () => {
    onAddExtraBottle()
    showToast('+1 garrafa (500ml) adicionada à sua meta de hoje!', 'info')
  }

  return (
    <Card style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Glow de água azul ao fundo */}
      <Box
        style={{
          position: 'absolute',
          top: -30,
          left: -30,
          width: 160,
          height: 160,
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <CardHeader>
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Box>
            <Group gap="xs" align="center">
              <TbDropletFilled size={22} color="#38bdf8" />
              <CardTitle>Hidratação Diária (500ml)</CardTitle>
            </Group>
            <CardDescription>
              {currentWeight
                ? `Meta calculada: 35 ml × ${currentWeight.toFixed(1)} kg = ${targetMl} ml recomendados`
                : 'Meta diária recomendada: 2.000 ml (4 garrafas). Cadastre seu peso para meta personalizada.'}
            </CardDescription>
          </Box>

          <Group gap="xs">
            {isGoalReached ? (
              <Badge
                variant="gradient"
                gradient={{ from: 'cyan', to: 'blue' }}
                size="md"
                leftSection={<TbTrophy size={14} />}
              >
                Meta Atingida!
              </Badge>
            ) : (
              <Badge variant="light" color="cyan" size="md">
                {progressPercent}% concluído
              </Badge>
            )}
          </Group>
        </Group>
      </CardHeader>

      <CardContent>
        <Stack gap="md">
          {/* Barra de Progresso e Métricas Numéricas */}
          <Box
            p="md"
            style={{
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <Group justify="space-between" align="baseline" mb="xs">
              <Group align="baseline" gap="xs">
                <Text size="26px" fw={800} c="#38bdf8" style={{ lineHeight: 1 }}>
                  {totalConsumedMl.toLocaleString('pt-BR')}
                </Text>
                <Text size="sm" c="dimmed">
                  / {targetMl.toLocaleString('pt-BR')} ml
                </Text>
              </Group>

              <Text size="xs" c="dimmed">
                <span style={{ color: '#fff', fontWeight: 600 }}>{consumedBottles}</span> de{' '}
                <span style={{ color: '#fff', fontWeight: 600 }}>{targetBottles}</span> garrafinhas
              </Text>
            </Group>

            <Progress
              value={progressPercent}
              size="lg"
              radius="xl"
              color="cyan"
              animated={progressPercent < 100 && progressPercent > 0}
              styles={{
                root: {
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)'
                },
                section: {
                  background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
                  boxShadow: '0 0 12px rgba(56, 189, 248, 0.5)'
                }
              }}
            />
          </Box>

          {/* Instrução rápida */}
          <Group gap="xs" align="center">
            <TbInfoCircle size={15} color="#38bdf8" />
            <Text size="xs" c="dimmed">
              Clique em cada garrafinha de 500ml ao beber para marcá-la em azul:
            </Text>
          </Group>

          {/* Grid de Garrafinhas Interativas de 500ml */}
          <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, md: 5, lg: 6 }} spacing="sm">
            {Array.from({ length: targetBottles }).map((_, index) => (
              <WaterBottleItem
                key={index}
                index={index}
                isFilled={index < consumedBottles}
                onClick={() => handleBottleClick(index)}
              />
            ))}
          </SimpleGrid>

          {/* Ações adicionais: Adicionar mais garrafas ou resetar */}
          <Group justify="space-between" align="center" mt="xs" wrap="wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddExtra}
              leftIcon={<TbPlus size={16} />}
            >
              Adicionar +1 Garrafa (500ml)
            </Button>

            {consumedBottles > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetToday}
                leftIcon={<TbRotateClockwise2 size={14} />}
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
