import { useState, useEffect } from 'react'
import { Group, Stack, Text, Box, SimpleGrid, Slider, UnstyledButton } from '@mantine/core'
import {
  TbAdjustmentsHorizontal,
  TbCheckbox,
  TbDroplet,
  TbMoonStars,
  TbCheck,
  TbAlertCircle
} from 'react-icons/tb'

import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@components/ui/card'
import Button from '@components/ui/button'
import Badge from '@components/ui/badge'
import useHealthStore from '@stores/health'
import useToastStore from '@stores/toast'
import { infoCardItemStyle } from '../../styles'
import type { ProfilePerformanceWeightsCardProps } from './types'

export const ProfilePerformanceWeightsCard = ({ className }: ProfilePerformanceWeightsCardProps) => {
  const { performanceWeights, updatePerformanceWeights } = useHealthStore()
  const { showToast } = useToastStore()

  const [habits, setHabits] = useState<number>(performanceWeights.habits)
  const [water, setWater] = useState<number>(performanceWeights.water)
  const [sleep, setSleep] = useState<number>(performanceWeights.sleep)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setHabits(performanceWeights.habits)
    setWater(performanceWeights.water)
    setSleep(performanceWeights.sleep)
  }, [performanceWeights.habits, performanceWeights.water, performanceWeights.sleep])

  const total = habits + water + sleep
  const isValid = total === 100
  const isChanged =
    habits !== performanceWeights.habits ||
    water !== performanceWeights.water ||
    sleep !== performanceWeights.sleep

  const applyPreset = (h: number, w: number, s: number) => {
    setHabits(h)
    setWater(w)
    setSleep(s)
  }

  const handleSave = async () => {
    if (!isValid) {
      showToast('A soma de todos os itens deve ser exatamente 100%.', 'error')
      return
    }

    setIsSaving(true)
    try {
      await updatePerformanceWeights({
        habits,
        water,
        sleep
      })
      showToast('Pesos do desempenho geral configurados com sucesso!', 'success')
    } catch {
      showToast('Ocorreu um erro ao salvar os pesos no servidor.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card id="profile-performance-weights-card" className={className}>
      <CardHeader>
        <Group justify="space-between" align="center" wrap="nowrap">
          <Box>
            <CardTitle>Pesos do Desempenho Geral</CardTitle>
            <CardDescription>
              Configure o quanto cada pilar vale no cálculo da sua constância diária (a soma deve ser 100%)
            </CardDescription>
          </Box>
          <Badge variant={isValid ? 'success' : 'warning'}>
            {isValid ? 'Total 100%' : `Total: ${total}%`}
          </Badge>
        </Group>
      </CardHeader>

      <CardContent>
        <Stack gap="lg">
          {/* Barra de distribuição visual dos 100% */}
          <Box>
            <Group justify="space-between" align="center" mb={6}>
              <Text size="xs" fw={600} c="dimmed">
                Distribuição dos 100%
              </Text>
              <Group gap={6} align="center">
                {isValid ? (
                  <Group gap={4} align="center">
                    <TbCheck size={14} color="#10b981" />
                    <Text size="xs" fw={600} c="#10b981">
                      100% alocado perfeitamente
                    </Text>
                  </Group>
                ) : total < 100 ? (
                  <Group gap={4} align="center">
                    <TbAlertCircle size={14} color="#f59e0b" />
                    <Text size="xs" fw={600} c="#f59e0b">
                      Faltam {100 - total}% para completar 100%
                    </Text>
                  </Group>
                ) : (
                  <Group gap={4} align="center">
                    <TbAlertCircle size={14} color="#ef4444" />
                    <Text size="xs" fw={600} c="#ef4444">
                      Excede o total em {total - 100}%
                    </Text>
                  </Group>
                )}
              </Group>
            </Group>

            <Box
              style={{
                height: 12,
                borderRadius: 999,
                overflow: 'hidden',
                display: 'flex',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              {habits > 0 && (
                <Box
                  style={{
                    width: `${habits}%`,
                    backgroundColor: '#a855f7',
                    transition: 'width 0.2s ease'
                  }}
                />
              )}
              {water > 0 && (
                <Box
                  style={{
                    width: `${water}%`,
                    backgroundColor: '#06b6d4',
                    transition: 'width 0.2s ease'
                  }}
                />
              )}
              {sleep > 0 && (
                <Box
                  style={{
                    width: `${sleep}%`,
                    backgroundColor: '#6366f1',
                    transition: 'width 0.2s ease'
                  }}
                />
              )}
            </Box>

            <Group justify="space-between" align="center" mt={6} wrap="wrap" gap="xs">
              <Group gap={4} align="center">
                <Box w={8} h={8} style={{ borderRadius: '50%', backgroundColor: '#a855f7' }} />
                <Text size="xs" c="dimmed">
                  Hábitos: <strong style={{ color: '#fff' }}>{habits}%</strong>
                </Text>
              </Group>
              <Group gap={4} align="center">
                <Box w={8} h={8} style={{ borderRadius: '50%', backgroundColor: '#06b6d4' }} />
                <Text size="xs" c="dimmed">
                  Água: <strong style={{ color: '#fff' }}>{water}%</strong>
                </Text>
              </Group>
              <Group gap={4} align="center">
                <Box w={8} h={8} style={{ borderRadius: '50%', backgroundColor: '#6366f1' }} />
                <Text size="xs" c="dimmed">
                  Sono: <strong style={{ color: '#fff' }}>{sleep}%</strong>
                </Text>
              </Group>
            </Group>
          </Box>

          {/* Presets rápidos */}
          <Box>
            <Text size="xs" fw={600} c="dimmed" mb={8}>
              Sugestões rápidas de equilíbrio:
            </Text>
            <Group gap="xs" wrap="wrap">
              <UnstyledButton
                onClick={() => applyPreset(50, 25, 25)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  backgroundColor:
                    habits === 50 && water === 25 && sleep === 25
                      ? 'rgba(168, 85, 247, 0.25)'
                      : 'rgba(255, 255, 255, 0.04)',
                  color: habits === 50 && water === 25 && sleep === 25 ? '#d8b4fe' : '#94a3b8',
                  border:
                    habits === 50 && water === 25 && sleep === 25
                      ? '1px solid rgba(168, 85, 247, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.15s ease'
                }}
              >
                Foco em Hábitos (50 / 25 / 25)
              </UnstyledButton>

              <UnstyledButton
                onClick={() => applyPreset(34, 33, 33)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  backgroundColor:
                    habits === 34 && water === 33 && sleep === 33
                      ? 'rgba(99, 102, 241, 0.25)'
                      : 'rgba(255, 255, 255, 0.04)',
                  color: habits === 34 && water === 33 && sleep === 33 ? '#a5b4fc' : '#94a3b8',
                  border:
                    habits === 34 && water === 33 && sleep === 33
                      ? '1px solid rgba(99, 102, 241, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.15s ease'
                }}
              >
                Equilibrado (34 / 33 / 33)
              </UnstyledButton>

              <UnstyledButton
                onClick={() => applyPreset(30, 35, 35)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  backgroundColor:
                    habits === 30 && water === 35 && sleep === 35
                      ? 'rgba(6, 182, 212, 0.25)'
                      : 'rgba(255, 255, 255, 0.04)',
                  color: habits === 30 && water === 35 && sleep === 35 ? '#67e8f9' : '#94a3b8',
                  border:
                    habits === 30 && water === 35 && sleep === 35
                      ? '1px solid rgba(6, 182, 212, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.15s ease'
                }}
              >
                Foco em Saúde (30 / 35 / 35)
              </UnstyledButton>
            </Group>
          </Box>

          {/* Cards de ajuste individual */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            {/* Hábitos */}
            <Box style={infoCardItemStyle}>
              <Group justify="space-between" align="center" mb="xs">
                <Group gap="xs" align="center">
                  <TbCheckbox size={18} color="#a855f7" />
                  <Text size="xs" fw={700} c="white">
                    Hábitos
                  </Text>
                </Group>
                <Text size="sm" fw={700} c="#c084fc">
                  {habits}%
                </Text>
              </Group>
              <Text size="11px" c="dimmed" mb="md" style={{ minHeight: 32 }}>
                Peso das tarefas e rotinas cadastradas no dia
              </Text>
              <Slider
                value={habits}
                onChange={setHabits}
                min={0}
                max={100}
                step={5}
                color="grape"
                size="sm"
              />
            </Box>

            {/* Água */}
            <Box style={infoCardItemStyle}>
              <Group justify="space-between" align="center" mb="xs">
                <Group gap="xs" align="center">
                  <TbDroplet size={18} color="#06b6d4" />
                  <Text size="xs" fw={700} c="white">
                    Hidratação
                  </Text>
                </Group>
                <Text size="sm" fw={700} c="#38bdf8">
                  {water}%
                </Text>
              </Group>
              <Text size="11px" c="dimmed" mb="md" style={{ minHeight: 32 }}>
                Peso do cumprimento da meta diária de água
              </Text>
              <Slider
                value={water}
                onChange={setWater}
                min={0}
                max={100}
                step={5}
                color="cyan"
                size="sm"
              />
            </Box>

            {/* Sono */}
            <Box style={infoCardItemStyle}>
              <Group justify="space-between" align="center" mb="xs">
                <Group gap="xs" align="center">
                  <TbMoonStars size={18} color="#6366f1" />
                  <Text size="xs" fw={700} c="white">
                    Sono
                  </Text>
                </Group>
                <Text size="sm" fw={700} c="#818cf8">
                  {sleep}%
                </Text>
              </Group>
              <Text size="11px" c="dimmed" mb="md" style={{ minHeight: 32 }}>
                Peso de atingir o mínimo recomendado de 7h
              </Text>
              <Slider
                value={sleep}
                onChange={setSleep}
                min={0}
                max={100}
                step={5}
                color="indigo"
                size="sm"
              />
            </Box>
          </SimpleGrid>

          {/* Ações */}
          <Group justify="flex-end" pt="xs">
            <Button
              variant="primary"
              size="sm"
              isLoading={isSaving}
              disabled={!isValid || (!isChanged && isValid)}
              onClick={handleSave}
              leftIcon={<TbAdjustmentsHorizontal size={16} />}
            >
              Salvar Pesos do Desempenho
            </Button>
          </Group>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default ProfilePerformanceWeightsCard
