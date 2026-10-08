import { useState } from 'react'
import { Group, Stack, Text, Box, Badge as MantineBadge } from '@mantine/core'
import { TbPencil, TbRuler, TbCalendarTime, TbUser } from 'react-icons/tb'

import Card, { CardHeader, CardTitle, CardContent } from '@components/ui/card'
import ActionIcon from '@components/ui/actionIcon'
import { CHARACTERS } from '@stores/health/utils'
import { CharacterAvatar } from '@pages/home/components/characterCard/characterAvatars'
import { EditPhysicalInfoModal } from '@pages/home/components/characterCard/editPhysicalInfoModal'
import type { HealthProfile } from '@stores/health/types'

interface CompactCharacterCardProps {
  profile: HealthProfile
  latestWeight?: number
  onUpdateProfile: (data: Partial<HealthProfile>) => void
}

export const CompactCharacterCard = ({
  profile,
  latestWeight,
  onUpdateProfile
}: CompactCharacterCardProps) => {
  const [modalOpened, setModalOpened] = useState(false)

  const activeChar = CHARACTERS.find((c) => c.id === profile.characterId) || CHARACTERS[0]
  const heightFormatted = profile.height ? `${(profile.height / 100).toFixed(2)}m` : '-'
  const ageFormatted = profile.age ? `${profile.age}a` : '-'

  return (
    <>
      <Card style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Glow suave no topo */}
        <Box
          style={{
            position: 'absolute',
            top: -24,
            right: -24,
            width: 100,
            height: 100,
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        <CardHeader style={{ paddingBottom: 6 }}>
          <Group justify="space-between" align="center" wrap="nowrap">
            <Group gap={6} align="center">
              <TbUser size={18} color="#38bdf8" />
              <CardTitle style={{ fontSize: '14px', fontWeight: 700 }}>Pessoa</CardTitle>
            </Group>

            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => setModalOpened(true)}
              title="Editar dados físicos"
            >
              <TbPencil size={14} />
            </ActionIcon>
          </Group>
        </CardHeader>

        <CardContent style={{ paddingTop: 0 }}>
          <Group justify="space-between" align="center" wrap="nowrap">
            {/* Lado Esquerdo: Avatar + Nome */}
            <Group gap="sm" align="center" wrap="nowrap">
              <Box
                style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
                onClick={() => setModalOpened(true)}
                title="Clique para editar avatar e físico"
              >
                <CharacterAvatar
                  id={profile.characterId}
                  size={50}
                  interactive
                />
                <Box
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    background: '#0284c7',
                    borderRadius: '50%',
                    padding: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #0f172a'
                  }}
                >
                  <TbPencil size={10} color="#fff" />
                </Box>
              </Box>

              <Stack gap={2}>
                <Group gap={6} align="center" wrap="nowrap">
                  <Text size="xs" fw={700} c="white">
                    {activeChar.name}
                  </Text>
                  <MantineBadge size="xs" variant="light" color="cyan">
                    Ativo
                  </MantineBadge>
                </Group>
                <Text size="11px" c="dimmed">
                  Perfil e biofísico
                </Text>
              </Stack>
            </Group>

            {/* Lado Direito: Badges físicos */}
            <Group gap={6} wrap="nowrap" justify="flex-end">
              <MantineBadge
                variant="subtle"
                color="gray"
                size="xs"
                leftSection={<TbCalendarTime size={11} />}
                style={{ padding: '0 6px', height: 20 }}
              >
                {ageFormatted}
              </MantineBadge>

              <MantineBadge
                variant="subtle"
                color="gray"
                size="xs"
                leftSection={<TbRuler size={11} />}
                style={{ padding: '0 6px', height: 20 }}
              >
                {heightFormatted}
              </MantineBadge>

              {latestWeight && (
                <MantineBadge
                  variant="subtle"
                  color="teal"
                  size="xs"
                  style={{ padding: '0 6px', height: 20 }}
                >
                  {latestWeight.toFixed(1)}kg
                </MantineBadge>
              )}
            </Group>
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

export default CompactCharacterCard
