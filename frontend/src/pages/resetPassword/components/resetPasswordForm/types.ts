export type ResetPasswordStep = 'email' | 'code' | 'password' | 'success'

export interface ResetPasswordFormProps {
  initialEmail?: string
  onSuccess?: () => void
  onCancel?: () => void
}
