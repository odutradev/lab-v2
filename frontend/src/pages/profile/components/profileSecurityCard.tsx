import { Group, Box, Text, ThemeIcon, Stack, Divider, ActionIcon, Tooltip, Anchor } from '@mantine/core'
import {
  TbKey,
  TbCalendarEvent,
  TbUnlink,
  TbBrandGoogle,
  TbEdit,
  TbExternalLink,
  TbTrash,
  TbPlus,
  TbAlertTriangle
} from 'react-icons/tb'

import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@components/ui/card'
import Button from '@components/ui/button'
import Badge from '@components/ui/badge'
import Modal from '@components/ui/modal'
import Input from '@components/ui/input'

import type { GoogleCalendarStatusResponse } from '@actions/google/calendar/types'

interface ProfileSecurityCardProps {
  onNavigateResetPassword: () => void
  calendarStatus?: GoogleCalendarStatusResponse
  isCalendarLoading?: boolean
  isConnectingCalendar?: boolean
  isDisconnectingCalendar?: boolean
  isSavingCalendarName?: boolean
  isRecreatingCalendar?: boolean
  isDisconnectModalOpen: boolean
  isEditCalendarNameModalOpen: boolean
  calendarNameInput: string
  onCalendarNameInputChange: (value: string) => void
  onConnectCalendar?: () => void
  onOpenDisconnectModal: () => void
  onCloseDisconnectModal: () => void
  onConfirmDisconnect: (deleteCalendar: boolean) => void
  onOpenEditCalendarNameModal: () => void
  onCloseEditCalendarNameModal: () => void
  onSaveCalendarName: () => void
  onRecreateCalendar?: () => void
}

export const ProfileSecurityCard = ({
  onNavigateResetPassword,
  calendarStatus,
  isCalendarLoading = false,
  isConnectingCalendar = false,
  isDisconnectingCalendar = false,
  isSavingCalendarName = false,
  isRecreatingCalendar = false,
  isDisconnectModalOpen,
  isEditCalendarNameModalOpen,
  calendarNameInput,
  onCalendarNameInputChange,
  onConnectCalendar,
  onOpenDisconnectModal,
  onCloseDisconnectModal,
  onConfirmDisconnect,
  onOpenEditCalendarNameModal,
  onCloseEditCalendarNameModal,
  onSaveCalendarName,
  onRecreateCalendar
}: ProfileSecurityCardProps) => {
  const isConnected = !!calendarStatus?.connected
  const isCalendarDeleted = !!calendarStatus?.calendarDeleted
  const calendarName = calendarStatus?.calendarName || 'Lab V2'
  const calendarUrl = calendarStatus?.calendarUrl

  const disconnectActions = [
    {
      key: 'unlink-only',
      title: 'Somente desvincular',
      description: 'Remove a conexão no LAB. A agenda e todos os eventos continuarão salvos no seu Google Agenda.',
      icon: <TbUnlink size={20} />,
      variant: 'secondary' as const,
      isLoading: isDisconnectingCalendar,
      onClick: () => onConfirmDisconnect(false)
    },
    {
      key: 'unlink-and-delete',
      title: 'Desvincular e apagar agenda',
      description: 'Remove a conexão no LAB e exclui permanentemente a agenda e seus eventos do seu Google Agenda.',
      icon: <TbTrash size={20} />,
      variant: 'danger' as const,
      isLoading: isDisconnectingCalendar,
      onClick: () => onConfirmDisconnect(true)
    }
  ]

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Integrações e Segurança</CardTitle>
          <CardDescription>
            Gerencie integrações com serviços externos e configurações de segurança da conta
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Stack gap="lg">
            <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
              <Group gap="md" align="flex-start">
                <ThemeIcon
                  size="lg"
                  radius="md"
                  variant="light"
                  color={!isConnected ? 'indigo' : isCalendarDeleted ? 'yellow' : 'teal'}
                >
                  {!isConnected ? (
                    <TbCalendarEvent size={20} />
                  ) : isCalendarDeleted ? (
                    <TbAlertTriangle size={20} />
                  ) : (
                    <TbBrandGoogle size={20} />
                  )}
                </ThemeIcon>
                <Box>
                  <Group gap="xs" align="center">
                    <Text size="sm" fw={600} c="white">
                      Google Agenda
                    </Text>
                    {isConnected && (
                      <Badge variant={isCalendarDeleted ? 'warning' : 'success'}>
                        {isCalendarDeleted ? 'Agenda Apagada no Google' : 'Conectado'}
                      </Badge>
                    )}
                  </Group>

                  <Text size="xs" c="dimmed" mt={2}>
                    {!isConnected
                      ? 'Vincule sua conta Google para sincronizar seus hábitos com sua agenda'
                      : isCalendarDeleted
                      ? `A agenda "${calendarName}" foi excluída no Google Calendar. Recrie-a para voltar a sincronizar seus hábitos.`
                      : `Sincronização ativa com ${calendarStatus?.email || 'sua conta Google'}`}
                  </Text>

                  {isConnected && !isCalendarDeleted && (
                    <Stack gap="xs" mt="sm">
                      <Group gap="xs" align="center">
                        <Text size="xs" c="gray.4" fw={500}>
                          Nome da Agenda:
                        </Text>
                        <Text size="xs" fw={600} c="white">
                          {calendarName}
                        </Text>
                        <Tooltip label="Editar nome da agenda">
                          <ActionIcon
                            size="xs"
                            variant="subtle"
                            color="indigo"
                            onClick={onOpenEditCalendarNameModal}
                            aria-label="Editar nome da agenda"
                          >
                            <TbEdit size={14} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>

                      {calendarUrl && (
                        <Group gap="xs" align="center">
                          <Text size="xs" c="gray.4" fw={500}>
                            Acesso:
                          </Text>
                          <Anchor
                            href={calendarUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="xs"
                            c="indigo.3"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              textDecoration: 'none'
                            }}
                          >
                            Abrir no Google Agenda
                            <TbExternalLink size={13} />
                          </Anchor>
                        </Group>
                      )}
                    </Stack>
                  )}
                </Box>
              </Group>

              {isConnected ? (
                <Group gap="xs">
                  {isCalendarDeleted && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onRecreateCalendar}
                      isLoading={isRecreatingCalendar}
                      disabled={isCalendarLoading}
                      leftIcon={<TbPlus size={16} />}
                    >
                      Criar Novamente
                    </Button>
                  )}
                  <Button
                    variant={isCalendarDeleted ? 'ghost' : 'danger'}
                    size="sm"
                    onClick={onOpenDisconnectModal}
                    isLoading={isDisconnectingCalendar}
                    disabled={isCalendarLoading}
                    leftIcon={<TbUnlink size={16} />}
                  >
                    Desvincular
                  </Button>
                </Group>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onConnectCalendar}
                  isLoading={isConnectingCalendar}
                  disabled={isCalendarLoading}
                  leftIcon={<TbCalendarEvent size={16} />}
                >
                  Vincular Google Agenda
                </Button>
              )}
            </Group>

            <Divider color="rgba(255, 255, 255, 0.08)" />

            <Group justify="space-between" align="center" wrap="wrap" gap="md">
              <Group gap="md">
                <ThemeIcon size="lg" radius="md" variant="light" color="indigo">
                  <TbKey size={20} />
                </ThemeIcon>
                <Box>
                  <Text size="sm" fw={600} c="white">
                    Senha de Acesso
                  </Text>
                  <Text size="xs" c="dimmed">
                    Recomendamos alterar sua senha periodicamente para manter sua conta protegida
                  </Text>
                </Box>
              </Group>

              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateResetPassword}
                leftIcon={<TbKey size={16} />}
              >
                Redefinir Senha
              </Button>
            </Group>
          </Stack>
        </CardContent>
      </Card>

      <Modal
        opened={isDisconnectModalOpen}
        onClose={onCloseDisconnectModal}
        type="actionChoice"
        variant="danger"
        title="Desvincular Google Agenda"
        description="Escolha como deseja prosseguir com a agenda sincronizada na sua conta Google:"
        actions={disconnectActions}
        cancelText="Voltar"
      />

      <Modal
        opened={isEditCalendarNameModalOpen}
        onClose={onCloseEditCalendarNameModal}
        type="default"
        variant="indigo"
        title="Editar Nome da Agenda"
        description="Altere o nome da agenda sincronizada no seu Google Agenda"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={onCloseEditCalendarNameModal}
              disabled={isSavingCalendarName}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={onSaveCalendarName}
              isLoading={isSavingCalendarName}
            >
              Salvar
            </Button>
          </>
        }
      >
        <Stack gap="md" pt="xs">
          <Input
            label="Nome da Agenda"
            placeholder="Ex: Minha Agenda Lab"
            value={calendarNameInput}
            onChange={(e) => onCalendarNameInputChange(e.target.value)}
            disabled={isSavingCalendarName}
            required
            leftIcon={<TbCalendarEvent size={18} />}
          />
        </Stack>
      </Modal>
    </>
  )
}

export default ProfileSecurityCard
