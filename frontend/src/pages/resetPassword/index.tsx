import { Box, Title, Text, Stack, ThemeIcon } from '@mantine/core'
import { TbKey } from 'react-icons/tb'

import ResetPasswordForm from './components/resetPasswordForm'
import Card, { CardContent } from '@components/ui/card'
import { containerStyle } from './styles'
import useResetPassword from './hook'

import type { ResetPasswordPageProps } from './types'

export const ResetPasswordPage = ({ onBack }: ResetPasswordPageProps) => {
  const { initialEmail, subtitle, handleBack } = useResetPassword({ onBack })

  return (
    <Box w="100%" style={containerStyle}>
      <Stack align="center" gap="xs" mb="xl" ta="center">
        <ThemeIcon
          size={56}
          radius="xl"
          variant="gradient"
          gradient={{ from: 'indigo', to: 'cyan' }}
        >
          <TbKey size={28} />
        </ThemeIcon>
        <Title order={1} size="h2" fw={800} c="white">
          Redefinição de Senha
        </Title>
        <Text size="sm" c="dimmed">
          {subtitle}
        </Text>
      </Stack>

      <Card>
        <CardContent>
          <ResetPasswordForm
            initialEmail={initialEmail}
            onSuccess={handleBack}
            onCancel={handleBack}
          />
        </CardContent>
      </Card>
    </Box>
  )
}

export default ResetPasswordPage
