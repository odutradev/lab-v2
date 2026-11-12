import { useState, useEffect } from 'react'
import { Group, Stack, Text, NumberInput, SimpleGrid, Box } from '@mantine/core'
import { TbRuler, TbCalendarTime, TbHeartRateMonitor, TbScale } from 'react-icons/tb'

import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@components/ui/card'
import Button from '@components/ui/button'
import Badge from '@components/ui/badge'
import useHealthStore from '@stores/health'
import useToastStore from '@stores/toast'
import { parseDecimalNumber, roundToOneDecimal } from '@stores/health/utils'
import { infoCardItemStyle } from '../../styles'

export const ProfilePhysicalCard = () => {
  const { profile, updateProfile, weightHistory, saveWeightRecord } = useHealthStore()
  const { showToast } = useToastStore()

  const latestWeight =
    weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : undefined

  const [height, setHeight] = useState<number | string>(
    profile.height ? (profile.height / 100).toFixed(2) : ''
  )
  const [weight, setWeight] = useState<number | string>(
    latestWeight !== undefined ? roundToOneDecimal(latestWeight).toFixed(1) : ''
  )
  const [age, setAge] = useState<number | string>(profile.age ?? '')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (profile.height !== undefined) {
      setHeight((profile.height / 100).toFixed(2))
    }
  }, [profile.height])

  useEffect(() => {
    if (latestWeight !== undefined) {
      setWeight(roundToOneDecimal(latestWeight).toFixed(1))
    }
  }, [latestWeight])

  useEffect(() => {
    if (profile.age !== undefined && profile.age !== age) {
      setAge(profile.age)
    }
  }, [profile.age, age])

  const isConfigured = Boolean(profile.height && profile.age)

  const handleSave = async () => {
    const heightM = parseDecimalNumber(height)
    const weightVal = parseDecimalNumber(weight)
    const ageNum = Number(age)

    if (height && (isNaN(heightM) || heightM < 0.5 || heightM > 2.5)) {
      showToast('Por favor, informe uma altura válida entre 0,50 m e 2,50 m (ex: 1,75 m).', 'error')
      return
    }

    if (weight && (isNaN(weightVal) || weightVal < 20 || weightVal > 350)) {
      showToast('Por favor, informe um peso válido entre 20 kg e 350 kg (ex: 75,0 kg).', 'error')
      return
    }

    if (age && (isNaN(ageNum) || ageNum < 5 || ageNum > 120)) {
      showToast('Por favor, informe uma idade válida entre 5 e 120 anos.', 'error')
      return
    }

    setIsSaving(true)
    try {
      const heightCm = heightM > 0 ? Math.round(heightM * 100) : undefined
      await updateProfile({
        height: heightCm,
        age: ageNum > 0 ? ageNum : undefined
      })

      if (weightVal > 0) {
        const roundedWeight = roundToOneDecimal(weightVal)
        await saveWeightRecord(roundedWeight)
      }

      showToast('Dados biofísicos salvos com sucesso na sua conta!', 'success')
    } catch {
      showToast('Ocorreu um erro ao salvar os dados no servidor.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card id="profile-physical-card">
      <CardHeader>
        <Group justify="space-between" align="center" wrap="nowrap">
          <Box>
            <CardTitle>Dados Biofísicos & Saúde</CardTitle>
            <CardDescription>
              Sua altura, peso e idade são utilizados para calibrar suas métricas e rotina de hidratação
            </CardDescription>
          </Box>
          <Badge variant={isConfigured ? 'success' : 'warning'}>
            {isConfigured ? 'Configurado' : 'Pendente'}
          </Badge>
        </Group>
      </CardHeader>

      <CardContent>
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <Box style={infoCardItemStyle}>
              <Group gap="sm" mb="xs">
                <TbRuler size={18} color="#38bdf8" />
                <Text size="xs" fw={600} c="dimmed">
                  Altura (em metros)
                </Text>
              </Group>

              <NumberInput
                placeholder="Ex: 1,75"
                value={height}
                onChange={(val) => setHeight(val)}
                min={0.5}
                max={2.5}
                step={0.01}
                decimalScale={2}
                fixedDecimalScale
                allowedDecimalSeparators={['.', ',']}
                suffix=" m"
                description={
                  height && parseDecimalNumber(height) > 0
                    ? `Equivalente a ${Math.round(parseDecimalNumber(height) * 100)} cm`
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
                <TbScale size={18} color="#a3e635" />
                <Text size="xs" fw={600} c="dimmed">
                  Peso atual (em kg)
                </Text>
              </Group>

              <NumberInput
                placeholder="Ex: 75,0"
                value={weight}
                onChange={(val) => setWeight(val)}
                min={20}
                max={350}
                step={0.1}
                decimalScale={1}
                fixedDecimalScale
                allowedDecimalSeparators={['.', ',']}
                suffix=" kg"
                description={
                  weight && parseDecimalNumber(weight) > 0
                    ? 'Sempre ajustado para 1 casa decimal'
                    : 'Necessário para monitorar sua evolução'
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
                onChange={(val) => setAge(val)}
                min={5}
                max={120}
                step={1}
                suffix=" anos"
                description="Necessário para ajustar taxa de hidratação"
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

