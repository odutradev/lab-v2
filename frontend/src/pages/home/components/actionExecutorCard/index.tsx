import { Stack, Group, Paper, Text, Code } from '@mantine/core'
import { TbRefresh } from 'react-icons/tb'

import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@components/ui/card'
import Button from '@components/ui/button'
import { actionResultCodeStyle } from '../../styles'
import type { ActionExecutorCardProps } from './types'

export const ActionExecutorCard = ({
  isLoading,
  actionResult,
  onFetchProfile
}: ActionExecutorCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Execução de Actions</CardTitle>
        <CardDescription>Executar actions isoladas por domínios (users/profile)</CardDescription>
      </CardHeader>
      <CardContent>
        <Stack gap="md">
          <Group>
            <Button
              variant="primary"
              size="sm"
              onClick={onFetchProfile}
              isLoading={isLoading}
              leftIcon={<TbRefresh size={15} />}
            >
              getProfileAction()
            </Button>
          </Group>

          {actionResult ? (
            <Code
              block
              p="md"
              style={{ ...actionResultCodeStyle, wordBreak: 'break-all', overflowX: 'auto' }}
            >
              {actionResult}
            </Code>
          ) : (
            <Paper p="md" radius="sm" bg="rgba(0, 0, 0, 0.25)" withBorder>
              <Text size="xs" c="dimmed">
                Clique acima para disparar a action e inspecionar a resposta da API em tempo real.
              </Text>
            </Paper>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}

export default ActionExecutorCard
