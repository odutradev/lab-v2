import { Stack, Text, Group, Box, ThemeIcon } from '@mantine/core'
import { TbAlertTriangle, TbRotateClockwise, TbCheck } from 'react-icons/tb'

import Modal from '@components/ui/modal'
import Button from '@components/ui/button'

interface ChallengeSlipModalProps {
  isOpen: boolean
  challengeTitle: string
  onClose: () => void
  onConfirm: (resetStreak: boolean) => void
  isLoading?: boolean
}

export const ChallengeSlipModal = ({
  isOpen,
  challengeTitle,
  onClose,
  onConfirm,
  isLoading = false
}: ChallengeSlipModalProps) => {
  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Registrar Deslize"
      variant="warning"
      size="md"
    >
      <Stack gap="md">
        <Group align="flex-start" gap="md">
          <ThemeIcon size="xl" radius="md" color="yellow" variant="light">
            <TbAlertTriangle size={24} />
          </ThemeIcon>
          <Box style={{ flex: 1 }}>
            <Text fw={600} size="sm" c="white">
              {challengeTitle}
            </Text>
            <Text size="xs" c="dimmed" mt={4} style={{ lineHeight: 1.5 }}>
              Deslizes fazem parte da jornada. O segredo é a constância a longo prazo, não a perfeição passageira. Escolha como prefere prosseguir:
            </Text>
          </Box>
        </Group>

        <Stack gap="sm">
          <Box
            onClick={() => !isLoading && onConfirm(false)}
            style={{
              padding: '14px',
              borderRadius: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Group justify="space-between">
              <Group gap="sm">
                <ThemeIcon size="md" radius="md" color="blue" variant="light">
                  <TbCheck size={18} />
                </ThemeIcon>
                <Box>
                  <Text size="sm" fw={600} c="white">
                    Manter histórico e seguir em frente
                  </Text>
                  <Text size="xs" c="dimmed">
                    Registra o deslize de hoje sem apagar os dias já acumulados.
                  </Text>
                </Box>
              </Group>
            </Group>
          </Box>

          <Box
            onClick={() => !isLoading && onConfirm(true)}
            style={{
              padding: '14px',
              borderRadius: 12,
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Group justify="space-between">
              <Group gap="sm">
                <ThemeIcon size="md" radius="md" color="red" variant="light">
                  <TbRotateClockwise size={18} />
                </ThemeIcon>
                <Box>
                  <Text size="sm" fw={600} c="red.4">
                    Recomeçar a contagem do zero
                  </Text>
                  <Text size="xs" c="dimmed">
                    Reseta os check-ins para iniciar um streak 100% novo hoje.
                  </Text>
                </Box>
              </Group>
            </Group>
          </Box>
        </Stack>

        <Group justify="flex-end" mt="xs">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

export default ChallengeSlipModal
