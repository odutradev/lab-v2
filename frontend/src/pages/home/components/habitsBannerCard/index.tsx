import { ThemeIcon, Group, Stack, Title, Text, Box } from '@mantine/core'
import { TbCalendarCheck, TbArrowRight } from 'react-icons/tb'

import Button from '@components/ui/button'
import Badge from '@components/ui/badge'
import Card from '@components/ui/card'

import type { HabitsBannerCardProps } from './types'

export const HabitsBannerCard = ({ onNavigateHabits }: HabitsBannerCardProps) => {
  return (
    <Card style={{ position: 'relative', overflow: 'hidden' }}>
      <Group justify="space-between" align="center" wrap="wrap" gap="lg">
        <Group gap="md" align="flex-start">
          <ThemeIcon
            size={48}
            radius="md"
            variant="gradient"
            gradient={{ from: 'indigo', to: 'cyan' }}
          >
            <TbCalendarCheck size={26} />
          </ThemeIcon>

          <Stack gap={4}>
            <Box>
              <Badge variant="primary">Novo Módulo</Badge>
            </Box>
            <Title order={4} fw={700} c="white">
              Agenda & Checklist de Metas
            </Title>
            <Text size="sm" c="dimmed" style={{ maxWidth: 520 }}>
              Defina metas diárias, semanais e mensais. Marque os itens cumpridos e acompanhe sua porcentagem de aproveitamento diário calculada automaticamente.
            </Text>
          </Stack>
        </Group>

        <Button
          variant="primary"
          onClick={onNavigateHabits}
          rightIcon={<TbArrowRight size={16} />}
        >
          Acessar Agenda
        </Button>
      </Group>
    </Card>
  )
}

export default HabitsBannerCard
