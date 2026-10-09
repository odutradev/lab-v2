import { useState } from 'react'
import { Group, Stack, Text, Title, Box, Badge as MantineBadge } from '@mantine/core'
import { TbPencil, TbSparkles, TbRuler, TbCalendarTime } from 'react-icons/tb'

import Card, { CardContent } from '@components/ui/card'
import ActionIcon from '@components/ui/actionIcon'
import { CHARACTERS } from '@stores/health/utils'
import { CharacterAvatar } from './characterAvatars'
import { EditPhysicalInfoModal } from './editPhysicalInfoModal'
import type { CharacterCardProps } from './types'

export const CharacterCard = ({
  profile,
  latestWeight,
  onUpdateProfile
}: CharacterCardProps) => {
  const [modalOpened, setModalOpened] = useState(false)

  const activeChar = CHARACTERS.find((c) => c.id === profile.characterId) || CHARACTERS[0]
  const heightFormatted = profile.height ? `${(profile.height / 100).toFixed(2)} m` : null
  const ageFormatted = profile.age ? `${profile.age} anos` : null

  return (
    <>
      <Card style={{ position: 'relative', overflow: 'hidden' }}>
        <Box
          style={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 140,
            height: 140,
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        <CardContent>
          <Group justify="space-between" align="center" wrap="wrap" gap="md">
            <Group gap="md" align="center" wrap="wrap" style={{ flex: 1, minWidth: 0 }}>
              <Box style={{ position: 'relative', flexShrink: 0 }}>
                <CharacterAvatar
                  id={profile.characterId}
                  size={84}
                  interactive
                  onClick={() => setModalOpened(true)}
                />
                <Box
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    background: '#4f46e5',
                    borderRadius: '50%',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #0f172a',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setModalOpened(true)}
                  title="Alterar dados"
                >
                  <TbPencil size={12} color="#fff" />
                </Box>
              </Box>

              <Stack gap={4} style={{ flex: 1, minWidth: 'min(100%, 220px)' }}>
                <Group gap="xs" align="center">
                  <MantineBadge
                    size="xs"
                    variant="gradient"
                    gradient={{ from: 'indigo', to: 'cyan' }}
                  >
                    Companheiro LAB
                  </MantineBadge>
                  <Text size="xs" c="dimmed">
                    • {activeChar.name}
                  </Text>
                </Group>

                <Title order={4} fw={700} c="white">
                  {profile.height && profile.age
                    ? 'Minhas Informações Físicas'
                    : 'Defina suas Informações Físicas'}
                </Title>

                <Text
                  size="xs"
                  c="dimmed"
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={() => setModalOpened(true)}
                >
                  <TbSparkles size={13} color="#818cf8" />
                  Toque no personagem para alterar idade e altura
                </Text>

                <Group gap="xs" mt={6} wrap="wrap">
                  <MantineBadge
                    variant="light"
                    color="indigo"
                    size="md"
                    radius="md"
                    leftSection={<TbCalendarTime size={14} />}
                  >
                    {ageFormatted || 'Idade: Não definida'}
                  </MantineBadge>

                  <MantineBadge
                    variant="light"
                    color="cyan"
                    size="md"
                    radius="md"
                    leftSection={<TbRuler size={14} />}
                  >
                    {heightFormatted || 'Altura: Não definida'}
                  </MantineBadge>

                  {latestWeight && (
                    <MantineBadge
                      variant="light"
                      color="teal"
                      size="md"
                      radius="md"
                    >
                      {latestWeight.toFixed(1)} kg atual
                    </MantineBadge>
                  )}
                </Group>
              </Stack>
            </Group>

            <ActionIcon
              variant="subtle"
              size="lg"
              onClick={() => setModalOpened(true)}
              title="Configurar Informações Físicas"
            >
              <TbPencil size={18} />
            </ActionIcon>
          </Group>
        </CardContent>
      </Card>

      <EditPhysicalInfoModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        currentProfile={profile}
        onSave={onUpdateProfile}
      />
    </>
  )
}

export default CharacterCard
