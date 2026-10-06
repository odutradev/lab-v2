import { Box, Title, Text, Stack, ThemeIcon, SegmentedControl } from '@mantine/core'
import { IconStack2 } from '@tabler/icons-react'
import { useState } from 'react'

import RegisterForm from '@components/forms/RegisterForm'
import Card, { CardContent } from '@components/ui/Card'
import LoginForm from '@components/forms/LoginForm'

export const AuthPage = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  return (
    <Box w="100%" style={{ maxWidth: 460, margin: '0 auto' }}>
      <Stack align="center" gap="xs" mb="xl" ta="center">
        <ThemeIcon
          size={56}
          radius="xl"
          variant="gradient"
          gradient={{ from: 'indigo', to: 'cyan' }}
        >
          <IconStack2 size={28} />
        </ThemeIcon>
        <Title order={1} size="h2" fw={800} c="white">
          LAB Portal
        </Title>
        <Text size="sm" c="dimmed">
          {activeTab === 'login'
            ? 'Entre com suas credenciais para acessar sua conta'
            : 'Preencha os dados abaixo para criar sua conta'}
        </Text>
      </Stack>

      <Card>
        <CardContent>
          <SegmentedControl
            fullWidth
            value={activeTab}
            onChange={(val) => setActiveTab(val as 'login' | 'register')}
            data={[
              { label: 'Entrar', value: 'login' },
              { label: 'Cadastrar', value: 'register' }
            ]}
            color="indigo"
            radius="md"
            size="md"
            mb="lg"
          />

          {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
        </CardContent>
      </Card>
    </Box>
  )
}

export default AuthPage
