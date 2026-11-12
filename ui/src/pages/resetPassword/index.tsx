import { Box } from '@mantine/core'

import Card, { CardContent } from '@components/ui/card'
import ResetPasswordHeader from './components/resetPasswordHeader'
import ResetPasswordForm from './components/resetPasswordForm'
import { containerStyle } from './styles'
import useResetPassword from './hook'

import type { ResetPasswordPageProps } from './types'

export const ResetPasswordPage = ({ onBack }: ResetPasswordPageProps) => {
  const { initialEmail, subtitle, handleBack } = useResetPassword({ onBack })

  return (
    <Box w="100%" style={containerStyle}>
      <ResetPasswordHeader subtitle={subtitle} />

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
