import { Group, Title, Text, Stack, ActionIcon, Box } from '@mantine/core'
import { TbChevronLeft, TbChevronRight, TbPlus, TbCalendar } from 'react-icons/tb'

import Button from '@components/ui/button'

import type { HabitsHeaderProps } from './types'

export const HabitsHeader = ({
  formattedDate,
  isToday,
  onPreviousDay,
  onNextDay,
  onToday,
  onOpenNewHabitModal
}: HabitsHeaderProps) => {
  return (
    <Box>
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
        <Stack gap={4}>
          <Title order={2} fw={700} c="white" style={{ letterSpacing: '-0.02em' }}>
            Agenda & Hábitos
          </Title>
          <Text size="sm" c="dimmed">
            Acompanhe seus hábitos, tarefas e compromissos com cálculo em tempo real de aproveitamento.
          </Text>
        </Stack>

        <Button
          variant="primary"
          leftIcon={<TbPlus size={18} />}
          onClick={onOpenNewHabitModal}
        >
          Novo Item
        </Button>
      </Group>

      <Group justify="space-between" align="center" mt="lg" wrap="wrap" gap="sm">
        <Group gap="xs">
          <ActionIcon
            variant="default"
            size="lg"
            radius="md"
            onClick={onPreviousDay}
            aria-label="Dia anterior"
          >
            <TbChevronLeft size={18} />
          </ActionIcon>

          <Group gap="xs" px="sm" py="xs" style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: 8 }}>
            <TbCalendar size={18} color="#818cf8" />
            <Text fw={600} size="sm" c="white">
              {formattedDate}
            </Text>
          </Group>

          <ActionIcon
            variant="default"
            size="lg"
            radius="md"
            onClick={onNextDay}
            aria-label="Próximo dia"
          >
            <TbChevronRight size={18} />
          </ActionIcon>

          {!isToday && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToday}
            >
              Ir para Hoje
            </Button>
          )}
        </Group>
      </Group>
    </Box>
  )
}

export default HabitsHeader
