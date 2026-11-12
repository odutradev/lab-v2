import { Stack, ThemeIcon, Title, Text, Group, Button, alpha } from '@mantine/core'
import { TbFileText, TbArrowLeft } from 'react-icons/tb'

import type { TermsHeaderProps } from './types'
import { colors } from '@styles/theme'

export const TermsHeader = ({ lastUpdated, onBack }: TermsHeaderProps) => {
  return (
    <Stack gap="md" mb="xl">
      <Group justify="space-between" align="center">
        <Button
          variant="subtle"
          color="gray"
          leftSection={<TbArrowLeft size={18} />}
          onClick={onBack}
          styles={{
            root: {
              color: colors.slate400,
              '&:hover': {
                color: colors.white,
                backgroundColor: alpha(colors.white, 0.05)
              }
            }
          }}
        >
          Voltar
        </Button>
        <Text size="xs" c="dimmed">
          Última atualização: {lastUpdated}
        </Text>
      </Group>

      <Group gap="md" align="center">
        <ThemeIcon
          size={52}
          radius="xl"
          variant="gradient"
          gradient={{ from: 'cyan', to: 'indigo' }}
        >
          <TbFileText size={28} />
        </ThemeIcon>
        <div>
          <Title order={1} size="h2" fw={800} c="white">
            Termos de Serviço
          </Title>
          <Text size="sm" c="dimmed">
            Regras e condições para utilização da plataforma e serviços do Lab
          </Text>
        </div>
      </Group>
    </Stack>
  )
}

export default TermsHeader
