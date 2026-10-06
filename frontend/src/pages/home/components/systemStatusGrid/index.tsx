import { SimpleGrid, Group, ThemeIcon, Box, Text } from '@mantine/core'
import { TbShield, TbStack2, TbActivity } from 'react-icons/tb'

import Card, { CardContent } from '@components/ui/card'
import type { SystemStatusGridProps } from './types'

export const SystemStatusGrid = ({ token }: SystemStatusGridProps) => {
  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
      <Card>
        <CardContent>
          <Group gap="md">
            <ThemeIcon size="lg" radius="md" variant="light" color="indigo">
              <TbShield size={22} />
            </ThemeIcon>
            <Box>
              <Text size="xs" c="dimmed">
                Token de Acesso
              </Text>
              <Text size="sm" fw={600} c="white">
                {token ? 'JWT Válido' : 'Não encontrado'}
              </Text>
            </Box>
          </Group>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Group gap="md">
            <ThemeIcon size="lg" radius="md" variant="light" color="cyan">
              <TbStack2 size={22} />
            </ThemeIcon>
            <Box>
              <Text size="xs" c="dimmed">
                Arquitetura de Actions
              </Text>
              <Text size="sm" fw={600} c="white">
                Domínio users Ativo
              </Text>
            </Box>
          </Group>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Group gap="md">
            <ThemeIcon size="lg" radius="md" variant="light" color="teal">
              <TbActivity size={22} />
            </ThemeIcon>
            <Box>
              <Text size="xs" c="dimmed">
                Estado da Aplicação
              </Text>
              <Text size="sm" fw={600} c="white">
                Online & Pronto
              </Text>
            </Box>
          </Group>
        </CardContent>
      </Card>
    </SimpleGrid>
  )
}

export default SystemStatusGrid
