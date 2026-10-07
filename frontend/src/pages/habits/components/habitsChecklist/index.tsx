import { Loader, ActionIcon, Stack, Group, Text, Box } from '@mantine/core'
import { TbCheck, TbCircle, TbInbox, TbClock, TbPencil, TbTrash } from 'react-icons/tb'

import Badge from '@components/ui/badge'
import Card from '@components/ui/card'

import type { HabitsChecklistProps } from './types'

export const HabitsChecklist = ({
  items,
  isLoading,
  togglingId,
  onToggle,
  onEdit,
  onRemove
}: HabitsChecklistProps) => {
  const getFrequencyBadge = (freq: string) => {
    switch (freq) {
      case 'daily':
        return <Badge variant="primary">Diária</Badge>
      case 'weekly':
        return <Badge variant="info">Semanal</Badge>
      case 'monthly':
        return <Badge variant="warning">Mensal</Badge>
      default:
        return <Badge variant="default">{freq}</Badge>
    }
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>Checklist do Dia</Card.Title>
        <Card.Description>Marque cada item conforme cumprir suas metas para atualizar seu aproveitamento.</Card.Description>
      </Card.Header>

      <Card.Content>
        {isLoading && items.length === 0 ? (
          <Group justify="center" py="xl">
            <Loader color="indigo" size="md" />
          </Group>
        ) : items.length === 0 ? (
          <Stack align="center" justify="center" py="xl" gap="sm">
            <TbInbox size={40} color="#6b7280" />
            <Text fw={600} size="md" c="white">
              Nenhuma meta para este dia
            </Text>
            <Text size="sm" c="dimmed" ta="center" style={{ maxWidth: 360 }}>
              Adicione novas metas diárias ou agende metas semanais/mensais disponíveis no painel abaixo.
            </Text>
          </Stack>
        ) : (
          <Stack gap="xs">
            {items.map((item) => {
              const isItemToggling = togglingId === item.habitId

              return (
                <Box
                  key={item.habitId}
                  p="md"
                  style={{
                    background: item.completed ? 'rgba(45, 212, 191, 0.05)' : 'rgba(255, 255, 255, 0.03)',
                    border: item.completed ? '1px solid rgba(45, 212, 191, 0.25)' : '1px solid rgba(255, 255, 255, 0.07)',
                    borderRadius: 10,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => !isItemToggling && onToggle(item.habitId)}
                >
                  <Group justify="space-between" align="center" wrap="nowrap">
                    <Group gap="md" align="center" wrap="nowrap" style={{ flex: 1 }}>
                      <ActionIcon
                        size="lg"
                        radius="xl"
                        variant={item.completed ? 'filled' : 'default'}
                        color={item.completed ? 'teal' : undefined}
                        loading={isItemToggling}
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggle(item.habitId)
                        }}
                        aria-label={item.completed ? 'Desmarcar' : 'Concluir meta'}
                      >
                        {item.completed ? <TbCheck size={20} /> : <TbCircle size={20} />}
                      </ActionIcon>

                      <Box style={{ flex: 1 }}>
                        <Text
                          fw={600}
                          size="sm"
                          c={item.completed ? 'dimmed' : 'white'}
                          style={{
                            textDecoration: item.completed ? 'line-through' : 'none',
                            transition: 'color 0.2s ease'
                          }}
                        >
                          {item.title}
                        </Text>
                        {item.description && (
                          <Text size="xs" c="dimmed" mt={2}>
                            {item.description}
                          </Text>
                        )}
                      </Box>
                    </Group>

                    <Group gap="xs" align="center">
                      {item.startTime && !item.allDay ? (
                        <Box
                          px={8}
                          py={3}
                          style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.15)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <TbClock size={12} color="#93c5fd" />
                          <Text size="11px" fw={600} c="#93c5fd">
                            {item.startTime}{item.endTime ? ` – ${item.endTime}` : ''}
                          </Text>
                        </Box>
                      ) : item.allDay ? (
                        <Badge variant="default">Dia inteiro</Badge>
                      ) : null}

                      {getFrequencyBadge(item.frequency || 'daily')}

                      {onEdit && (
                        <ActionIcon
                          size="md"
                          variant="subtle"
                          color="gray"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit(item.habitId)
                          }}
                          aria-label="Editar meta"
                        >
                          <TbPencil size={15} />
                        </ActionIcon>
                      )}

                      {onRemove && (
                        <ActionIcon
                          size="md"
                          variant="subtle"
                          color="red"
                          onClick={(e) => {
                            e.stopPropagation()
                            onRemove(item.habitId)
                          }}
                          aria-label="Excluir meta"
                        >
                          <TbTrash size={15} />
                        </ActionIcon>
                      )}
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

export default HabitsChecklist
