import { ActionIcon, Stack, Group, Text, Box } from '@mantine/core'
import { TbCalendarPlus, TbTrash, TbPencil, TbClock } from 'react-icons/tb'

import Button from '@components/ui/button'
import Badge from '@components/ui/badge'
import Card from '@components/ui/card'

import type { HabitsPoolProps } from './types'

export const HabitsPool = ({
  habits,
  dayHabitIds,
  onScheduleForDay,
  onRemoveHabit,
  onEditHabit,
  isScheduling
}: HabitsPoolProps) => {
  const periodicHabits = habits.filter((h) => h.frequency === 'weekly' || h.frequency === 'monthly')

  const getFrequencyBadge = (freq: string) => {
    switch (freq) {
      case 'weekly':
        return <Badge variant="info">Semanal</Badge>
      case 'monthly':
        return <Badge variant="warning">Mensal</Badge>
      default:
        return <Badge variant="primary">Diária</Badge>
    }
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>Metas Periódicas (Semanais e Mensais)</Card.Title>
        <Card.Description>
          Itens semanais e mensais entram na sua contagem do dia quando você os inclui ou cumpre na data selecionada.
        </Card.Description>
      </Card.Header>

      <Card.Content>
        {periodicHabits.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="md">
            Você ainda não tem metas semanais ou mensais cadastradas. Crie uma em "Nova Meta" acima!
          </Text>
        ) : (
          <Stack gap="sm">
            {periodicHabits.map((habit) => {
              const isAlreadyInDay = dayHabitIds.has(habit.id)

              return (
                <Box
                  key={habit.id}
                  p="sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 8,
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <Group justify="space-between" align="center" wrap="nowrap">
                    <Box style={{ flex: 1 }}>
                      <Group gap="xs" mb={2}>
                        <Text fw={600} size="sm" c="white">
                          {habit.title}
                        </Text>
                        {habit.startTime && (
                          <Box
                            px={8}
                            py={2}
                            style={{
                              backgroundColor: 'rgba(99, 102, 241, 0.15)',
                              border: '1px solid rgba(99, 102, 241, 0.3)',
                              borderRadius: 6,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <TbClock size={12} color="#a5b4fc" />
                            <Text size="11px" fw={600} c="#a5b4fc">
                              {habit.startTime}{habit.endTime ? ` – ${habit.endTime}` : ''}
                            </Text>
                          </Box>
                        )}
                        {getFrequencyBadge(habit.frequency)}
                      </Group>
                      {habit.description && (
                        <Text size="xs" c="dimmed">
                          {habit.description}
                        </Text>
                      )}
                    </Box>

                    <Group gap="xs">
                      {isAlreadyInDay ? (
                        <Badge variant="success">
                          Na agenda de hoje
                        </Badge>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<TbCalendarPlus size={16} />}
                          isLoading={isScheduling}
                          onClick={() => onScheduleForDay(habit.id)}
                        >
                          Incluir neste dia
                        </Button>
                      )}

                      {onEditHabit && (
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="md"
                          onClick={() => onEditHabit(habit.id)}
                          aria-label="Editar meta"
                        >
                          <TbPencil size={16} />
                        </ActionIcon>
                      )}

                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="md"
                        onClick={() => onRemoveHabit(habit.id)}
                        aria-label="Excluir meta"
                      >
                        <TbTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Box>
              )
            })}
          </Stack>
        )}
      </Card.Content>
    </Card>
  )
}

export default HabitsPool
