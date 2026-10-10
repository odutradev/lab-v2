import { useState } from 'react'
import { Stack, Group, Text, Box, SimpleGrid, UnstyledButton, NumberInput } from '@mantine/core'
import { TbUser, TbRulerMeasure, TbCalendar, TbSparkles } from 'react-icons/tb'

import Modal from '@components/ui/modal'
import Button from '@components/ui/button'
import useToastStore from '@stores/toast'
import { CHARACTERS, parseDecimalNumber } from '@stores/health/utils'
import type { CharacterId, HealthProfile } from '@stores/health/types'
import { CharacterAvatar } from '../characterAvatars'
import type { EditPhysicalInfoModalProps } from './types'

interface FormContentProps {
  currentProfile: HealthProfile
  onSave: (data: Partial<HealthProfile>) => void
  onClose: () => void
}

const PhysicalInfoFormContent = ({ currentProfile, onSave, onClose }: FormContentProps) => {
  const { showToast } = useToastStore()
  const [age, setAge] = useState<number | string>(currentProfile.age || '')
  const [height, setHeight] = useState<number | string>(currentProfile.height || '')
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterId>(currentProfile.characterId || 'spark')

  const handleConfirm = () => {
    const ageNum = Number(age)
    const rawHeight = parseDecimalNumber(height)
    let heightNum = rawHeight
    if (rawHeight > 0 && rawHeight <= 2.8) {
      heightNum = Math.round(rawHeight * 100)
    }

    if (age && (isNaN(ageNum) || ageNum < 1 || ageNum > 120)) {
      showToast('Por favor, informe uma idade válida (1 a 120 anos).', 'error')
      return
    }

    if (height && (isNaN(heightNum) || heightNum < 50 || heightNum > 260)) {
      showToast('Por favor, informe uma altura válida (ex: 175 cm ou 1,75 m).', 'error')
      return
    }

    onSave({
      age: ageNum || undefined,
      height: heightNum || undefined,
      characterId: selectedCharacter
    })

    showToast('Informações físicas salvas com sucesso!', 'success')
    onClose()
  }

  return (
    <Stack gap="md">
      <Box>
        <Text size="xs" fw={600} c="dimmed" mb="xs" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Escolha seu Personagem
        </Text>
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          {CHARACTERS.map((char) => {
            const isSelected = selectedCharacter === char.id
            return (
              <UnstyledButton
                key={char.id}
                onClick={() => setSelectedCharacter(char.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '12px 8px',
                  borderRadius: 12,
                  background: isSelected
                    ? 'rgba(99, 102, 241, 0.15)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected
                    ? '2px solid rgba(129, 140, 248, 0.9)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                <CharacterAvatar id={char.id} size={58} interactive={false} />
                <Text size="xs" fw={700} c={isSelected ? 'indigo.3' : 'white'} mt={6}>
                  {char.name}
                </Text>
                <Text size="10px" c="dimmed" ta="center">
                  {char.title}
                </Text>
              </UnstyledButton>
            )
          })}
        </SimpleGrid>
      </Box>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <NumberInput
          label="Idade (anos)"
          description="Ex: 26"
          placeholder="Ex: 26"
          value={age}
          onChange={(val) => setAge(val)}
          min={1}
          max={120}
          leftSection={<TbCalendar size={18} color="rgba(255, 255, 255, 0.5)" />}
          styles={{
            input: {
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              color: '#fff'
            }
          }}
        />

        <NumberInput
          label="Altura (cm ou m)"
          description="Ex: 1,75 ou 175"
          placeholder="Ex: 1,75"
          value={height}
          onChange={(val) => setHeight(val)}
          allowedDecimalSeparators={['.', ',']}
          leftSection={<TbRulerMeasure size={18} color="rgba(255, 255, 255, 0.5)" />}
          styles={{
            input: {
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              color: '#fff'
            }
          }}
        />
      </SimpleGrid>

      <Box
        p="xs"
        style={{
          borderRadius: 8,
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)'
        }}
      >
        <Group gap="xs" wrap="nowrap" align="flex-start">
          <TbSparkles size={18} color="#818cf8" style={{ flexShrink: 0, marginTop: 2 }} />
          <Text size="xs" c="indigo.2">
            Sua altura e idade serão usadas para o cálculo real de IMC (OMS) e para a recomendação ideal de hidratação diária.
          </Text>
        </Group>
      </Box>

      <Group justify="flex-end" gap="sm" mt="md">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleConfirm} leftIcon={<TbUser size={16} />}>
          Salvar Informações
        </Button>
      </Group>
    </Stack>
  )
}

export const EditPhysicalInfoModal = ({
  opened,
  onClose,
  currentProfile,
  onSave
}: EditPhysicalInfoModalProps) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Meu Personagem & Dados Físicos"
      description="Personalize seu companheiro e mantenha sua idade e altura atualizadas."
      variant="indigo"
      size="md"
    >
      {opened && (
        <PhysicalInfoFormContent
          currentProfile={currentProfile}
          onSave={onSave}
          onClose={onClose}
        />
      )}
    </Modal>
  )
}

export default EditPhysicalInfoModal
