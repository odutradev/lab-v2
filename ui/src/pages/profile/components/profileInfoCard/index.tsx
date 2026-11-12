import { SimpleGrid, Box, Text, Group, ThemeIcon } from '@mantine/core'
import {
  TbUser,
  TbMail,
  TbShieldCheck,
  TbCalendar,
  TbClock,
  TbFingerprint
} from 'react-icons/tb'

import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@components/ui/card'
import Badge from '@components/ui/badge'
import { infoCardItemStyle } from '../../styles'

import type { ProfileInfoCardProps } from './types'

export const ProfileInfoCard = ({ user, formatDate }: ProfileInfoCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Pessoais e da Conta</CardTitle>
        <CardDescription>
          Dados cadastrais associados ao seu acesso no LAB Portal
        </CardDescription>
      </CardHeader>

      <CardContent>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Box style={infoCardItemStyle}>
            <Group gap="sm" mb={4}>
              <ThemeIcon size="sm" variant="light" color="indigo">
                <TbUser size={14} />
              </ThemeIcon>
              <Text size="xs" fw={500} c="dimmed">
                Nome Completo
              </Text>
            </Group>
            <Text size="sm" fw={600} c="white">
              {user.name}
            </Text>
          </Box>

          <Box style={infoCardItemStyle}>
            <Group gap="sm" mb={4}>
              <ThemeIcon size="sm" variant="light" color="indigo">
                <TbMail size={14} />
              </ThemeIcon>
              <Text size="xs" fw={500} c="dimmed">
                E-mail
              </Text>
            </Group>
            <Group justify="space-between" align="center">
              <Text size="sm" fw={600} c="white" style={{ wordBreak: 'break-all' }}>
                {user.email}
              </Text>
              {user.emailVerified !== undefined && (
                <Badge variant={user.emailVerified ? 'success' : 'warning'}>
                  {user.emailVerified ? 'Verificado' : 'Pendente'}
                </Badge>
              )}
            </Group>
          </Box>

          <Box style={infoCardItemStyle}>
            <Group gap="sm" mb={4}>
              <ThemeIcon size="sm" variant="light" color="indigo">
                <TbShieldCheck size={14} />
              </ThemeIcon>
              <Text size="xs" fw={500} c="dimmed">
                Tipo de Acesso
              </Text>
            </Group>
            <Text size="sm" fw={600} c="white">
              {user.superAdmin ? 'Administrador Geral' : 'Usuário Padrão'}
            </Text>
          </Box>

          <Box style={infoCardItemStyle}>
            <Group gap="sm" mb={4}>
              <ThemeIcon size="sm" variant="light" color="indigo">
                <TbFingerprint size={14} />
              </ThemeIcon>
              <Text size="xs" fw={500} c="dimmed">
                ID da Conta
              </Text>
            </Group>
            <Text
              size="xs"
              fw={500}
              c="gray.4"
              style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
            >
              {user.id}
            </Text>
          </Box>

          {user.createdAt && (
            <Box style={infoCardItemStyle}>
              <Group gap="sm" mb={4}>
                <ThemeIcon size="sm" variant="light" color="indigo">
                  <TbCalendar size={14} />
                </ThemeIcon>
                <Text size="xs" fw={500} c="dimmed">
                  Cadastrado em
                </Text>
              </Group>
              <Text size="sm" fw={600} c="white">
                {formatDate(user.createdAt)}
              </Text>
            </Box>
          )}

          {user.updatedAt && (
            <Box style={infoCardItemStyle}>
              <Group gap="sm" mb={4}>
                <ThemeIcon size="sm" variant="light" color="indigo">
                  <TbClock size={14} />
                </ThemeIcon>
                <Text size="xs" fw={500} c="dimmed">
                  Última Atualização
                </Text>
              </Group>
              <Text size="sm" fw={600} c="white">
                {formatDate(user.updatedAt)}
              </Text>
            </Box>
          )}
        </SimpleGrid>
      </CardContent>
    </Card>
  )
}

export default ProfileInfoCard
