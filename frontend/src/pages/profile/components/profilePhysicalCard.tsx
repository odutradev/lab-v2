import { useState } from 'react'
import { Group, Stack, Text, NumberInput, SimpleGrid, Box } from '@mantine/core'
import { TbRuler, TbCalendarTime, TbHeartRateMonitor } from 'react-icons/tb'

import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@components/ui/card'
import Button from '@components/ui/button'
import Badge from '@components/ui/badge'
import useHealthStore from '@stores/health'
import useToastStore from '@stores/toast'
import { infoCardItemStyle } from '../styles'

export const ProfilePhysicalCard = () => {
  const { profile, updateProfile } = useHealthStore()
  const { showToast } = useToastStore()

  const [height, setHeight] = useState<number | string>(profile.height ?? '')
  const [age, setAge] = useState<number | string>(profile.age ?? '')
  const [isSaving, setIsSaving] = useState(false)

  const isConfigured = Boolean(profile.height && profile.age)

  const handleSave = () => {
    const heightNum = Number(height)
    const ageNum = Number(age)

    if (height && (isNaN(heightNum) || heightNum < 50 || heightNum > 250)) {
      showToast('Por favor, informe uma altura válida entre 50 cm e 250 cm.', 'error')
      return
    }

    if (age && (isNaN(ageNum) || ageNum < 5 || ageNum > 120)) {
      showToast('Por favor, informe uma idade válida entre 5 e 120 anos.', 'error')
      return
    }

    setIsSaving(true)
    updateProfile({
      height: heightNum > 0 ? heightNum : undefined,
      age: ageNum > 0 ? ageNum : undefined
    })
    setIsSaving(false)

    showToast('Dados biofísicos atualizados com sucesso!', 'success')
  }

  return (
    <Card>
      <CardHeader>
        <Group justify="space-between" align="center" wrap="nowrap">
          <Box>
            <CardTitle>Dados Biofísicos & Saúde</CardTitle>
            <CardDescription>
              Sua altura e idade são utilizadas para calcular automaticamente seu IMC e meta ideal de água
            </CardDescription>
          </Box>
          <Badge variant={isConfigured ? 'success' : 'warning'}>
            {isConfigured ? 'Configurado' : 'Pendente'}
          </Badge>
        </Group>
      </CardHeader>

      <CardContent>
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Box style={infoCardItemStyle}>
              <Group gap="sm" mb="xs">
                <TbRuler size={18} color="#38bdf8" />
                <Text size="xs" fw={600} c="dimmed">
                  Altura (em centímetros)
                </Text>
              </Group>

              <NumberInput
                placeholder="Ex: 175"
                value={height}
                onChange={(val) => setHeight(typeof val === 'number' ? val : '')}
                min={50}
                max={250}
                step={1}
                suffix=" cm"
                description={
                  height && Number(height) > 0
                    ? `Equivalente a ${(Number(height) / 100).toFixed(2)}m`
                    : 'Necessário para cálculo de IMC e índice metabólico'
                }
                styles={{
                  input: {
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontWeight: 600
                  }
                }}
              />
            </Box>

            <Box style={infoCardItemStyle}>
              <Group gap="sm" mb="xs">
                <TbCalendarTime size={18} color="#a855f7" />
                <Text size="xs" fw={600} c="dimmed">
                  Idade (em anos)
                </Text>
              </Group>

              <NumberInput
                placeholder="Ex: 26"
                value={age}
                onChange={(val) => setAge(typeof val === 'number' ? val : '')}
                min={5}
                max={120}
                step={1}
                suffix=" anos"
                description="Necessário para ajustar a taxa de hidratação por faixa etária"
                styles={{
                  input: {
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontWeight: 600
                  }
                }}
              />
            </Box>
          </SimpleGrid>

          <Group justify="flex-end" pt="xs">
            <Button
              variant="primary"
              size="sm"
              isLoading={isSaving}
              onClick={handleSave}
              leftIcon={<TbHeartRateMonitor size={16} />}
            >
              Salvar Dados Físicos
            </Button>
          </Group>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default ProfilePhysicalCard
