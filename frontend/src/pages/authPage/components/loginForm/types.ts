export interface LoginFormValues {
  email: string
  password: string
}

export interface LoginFormProps {
  onForgotPassword?: () => void
}
