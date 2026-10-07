import { Group, Box, Text, ThemeIcon, Stack, Divider } from '@mantine/core'
import { TbKey, TbCalendarEvent, TbUnlink, TbBrandGoogle } from 'react-icons/tb'

import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@components/ui/card'
import type { GoogleCalendarStatusResponse } from '@actions/google/calendar/types'
import Button from '@components/ui/button'
import Badge from '@components/ui/badge'

interface ProfileSecurityCardProps {
  onNavigateResetPassword: () => void
  calendarStatus?: GoogleCalendarStatusResponse
  isCalendarLoading?: boolean
  isConnectingCalendar?: boolean
  isDisconnectingCalendar?: boolean
  onConnectCalendar?: () => void
  onDisconnectCalendar?: () => void
}

export const ProfileSecurityCard = ({
  onNavigateResetPassword,
  calendarStatus,
  isCalendarLoading = false,
  isConnectingCalendar = false,
  isDisconnectingCalendar = false,
  onConnectCalendar,
  onDisconnectCalendar
}: ProfileSecurityCardProps) => {
  const isConnected = !!calendarStatus?.connected

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrações e Segurança</CardTitle>
        <CardDescription>
          Gerencie integrações com serviços externos e configurações de segurança da conta
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Stack gap="lg">
          {/* Seção Google Agenda - Acima de Redefinir Senha */}
          <Group justify="space-between" align="center" wrap="wrap" gap="md">
            <Group gap="md">
              <ThemeIcon size="lg" radius="md" variant="light" color={isConnected ? 'teal' : 'indigo'}>
                {isConnected ? <TbBrandGoogle size={20} /> : <TbCalendarEvent size={20} />}
              </ThemeIcon>
              <Box>
                <Group gap="xs" align="center">
                  <Text size="sm" fw={600} c="white">
                    Google Agenda
                  </Text>
                  {isConnected && (
                    <Badge variant="success">
                      Conectado
                    </Badge>
                  )}
                </Group>
                <Text size="xs" c="dimmed">
                  {isConnected
                    ? `Sincronização ativa com ${calendarStatus?.email || 'sua conta Google'}`
                    : 'Vincule sua conta Google para sincronizar seus hábitos com sua agenda'}
                </Text>
              </Box>
            </Group>

            {isConnected ? (
              <Button
                variant="danger"
                size="sm"
                onClick={onDisconnectCalendar}
                isLoading={isDisconnectingCalendar}
                disabled={isCalendarLoading}
                leftIcon={<TbUnlink size={16} />}
              >
                Desvincular
              </Button>
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

          {/* Seção Senha de Acesso */}
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
  )
}

export default ProfileSecurityCard
