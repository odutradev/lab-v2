import { Group, Box, Text, Progress, SimpleGrid, ThemeIcon } from '@mantine/core'
import {
  TbRuler,
  TbCalendarTime,
  TbBrandGoogle,
  TbCheck,
  TbAlertCircle,
  TbArrowDown
} from 'react-icons/tb'

import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@components/ui/card'
import Badge from '@components/ui/badge'
import Button from '@components/ui/button'
import useHealthStore from '@stores/health'
import type { GoogleCalendarStatusResponse } from '@actions/google/calendar/types'

interface ProfileProgressCardProps {
  calendarStatus?: GoogleCalendarStatusResponse
  onConnectCalendar?: () => void
}

export const ProfileProgressCard = ({
  calendarStatus,
  onConnectCalendar
}: ProfileProgressCardProps) => {
  const { profile } = useHealthStore()

  const hasHeight = Boolean(profile.height && profile.height > 0)
  const hasAge = Boolean(profile.age && profile.age > 0)
  const hasCalendar = Boolean(calendarStatus?.connected && !calendarStatus?.calendarDeleted)

  const steps = [
    {
      key: 'height',
      title: 'Altura',
      completed: hasHeight,
      valueText: hasHeight ? `${profile.height} cm` : undefined,
      description: 'Necessária para cálculo do IMC e metas metabólicas',
      icon: TbRuler,
      iconColor: '#38bdf8',
      targetId: 'profile-physical-card'
    },
    {
      key: 'age',
      title: 'Idade',
      completed: hasAge,
      valueText: hasAge ? `${profile.age} anos` : undefined,
      description: 'Necessária para calibrar taxa metabólica e hidratação',
      icon: TbCalendarTime,
      iconColor: '#a855f7',
      targetId: 'profile-physical-card'
    },
    {
      key: 'calendar',
      title: 'Google Agenda',
      completed: hasCalendar,
      valueText: hasCalendar ? 'Sincronizado' : undefined,
      description: 'Sincronize seus hábitos diretamente na sua agenda',
      icon: TbBrandGoogle,
      iconColor: '#818cf8',
      targetId: 'profile-security-card',
      action: onConnectCalendar
    }
  ]

  const totalSteps = steps.length
  const completedSteps = steps.filter((s) => s.completed).length
  const percentage = Math.round((completedSteps / totalSteps) * 100)

  if (completedSteps === totalSteps) {
    return null
  }

  const handleScrollTo = (targetId: string) => {
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <Card>
      <CardHeader>
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Box>
            <Group gap="xs" align="center">
              <CardTitle>Complete seu Perfil</CardTitle>
              <Badge variant={percentage >= 66 ? 'info' : 'warning'}>
                {percentage}% concluído
              </Badge>
            </Group>
            <CardDescription>
              Faltam {totalSteps - completedSteps} item(ns) para completar suas informações essenciais
            </CardDescription>
          </Box>

          <Text size="xs" fw={600} c="dimmed">
            {completedSteps} de {totalSteps} concluídos
          </Text>
        </Group>

        <Box mt="md">
          <Progress
            value={percentage}
            size="md"
            radius="xl"
            color={percentage >= 66 ? 'cyan' : 'indigo'}
            animated={percentage > 0}
          />
        </Box>
      </CardHeader>

      <CardContent>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <Box
                key={step.key}
                p="md"
                style={{
                  borderRadius: '8px',
                  backgroundColor: step.completed
                    ? 'rgba(34, 197, 94, 0.05)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${
                    step.completed
                      ? 'rgba(34, 197, 94, 0.2)'
                      : 'rgba(255, 255, 255, 0.08)'
                  }`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12
                }}
              >
                <Box>
                  <Group justify="space-between" align="flex-start" wrap="nowrap" mb={8}>
                    <Group gap="xs" align="center">
                      <ThemeIcon
                        size="md"
                        radius="md"
                        variant="light"
                        color={step.completed ? 'teal' : 'gray'}
                        style={{
                          backgroundColor: step.completed
                            ? 'rgba(34, 197, 94, 0.15)'
                            : 'rgba(255, 255, 255, 0.06)'
                        }}
                      >
                        <Icon size={18} color={step.completed ? '#4ade80' : step.iconColor} />
                      </ThemeIcon>
                      <Text size="sm" fw={600} c="white">
                        {step.title}
                      </Text>
                    </Group>

                    <Badge variant={step.completed ? 'success' : 'warning'}>
                      {step.completed ? (
                        <Group gap={4} align="center">
                          <TbCheck size={12} />
                          <span>{step.valueText || 'Concluído'}</span>
                        </Group>
                      ) : (
                        <Group gap={4} align="center">
                          <TbAlertCircle size={12} />
                          <span>Pendente</span>
                        </Group>
                      )}
                    </Badge>
                  </Group>

                  <Text size="xs" c="dimmed">
                    {step.description}
                  </Text>
                </Box>

                {!step.completed && (
                  <Group justify="flex-end" pt={4}>
                    {step.key === 'calendar' && step.action ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        h={28}
                        onClick={step.action}
                        leftIcon={<TbBrandGoogle size={14} />}
                      >
                        Conectar
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        h={28}
                        onClick={() => handleScrollTo(step.targetId)}
                        leftIcon={<TbArrowDown size={14} />}
                      >
                        Preencher
                      </Button>
                    )}
                  </Group>
                )}
              </Box>
            )
          })}
        </SimpleGrid>
      </CardContent>
    </Card>
  )
}

export default ProfileProgressCard
