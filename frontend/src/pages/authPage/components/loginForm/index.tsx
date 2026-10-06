import { TbMail, TbLock, TbLogin } from 'react-icons/tb'
import { Stack, Box, Group } from '@mantine/core'
import { useNavigate } from 'react-router-dom'

import useToastStore from '@stores/toast'
import useAuthStore from '@stores/auth'
import Button from '@components/ui/button'
import Input from '@components/ui/input'
import useForm from '@hooks/useForm'

import type { LoginFormValues, LoginFormProps } from './types'
import type { ApiError } from '@projectTypes/api'

export const LoginForm = ({ onForgotPassword }: LoginFormProps) => {
  const { login } = useAuthStore()
  const { showToast } = useToastStore()
  const navigate = useNavigate()

  const { values, errors, isSubmitting, handleChange, handleBlur, handleSubmit } =
    useForm<LoginFormValues>({
      initialValues: {
        email: '',
        password: ''
      },
      validationRules: {
        email: (val) => {
          if (!val) return 'E-mail é obrigatório'
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'E-mail inválido'
          return undefined
        },
        password: (val) => {
          if (!val) return 'Senha é obrigatória'
          return undefined
        }
      },
      onSubmit: async (formValues) => {
        try {
          await login(formValues)
          showToast('Login realizado com sucesso!', 'success')
        } catch (err) {
          const apiErr = err as ApiError
          showToast(apiErr.message || 'Falha ao autenticar', 'error', 'Erro no login')
        }
      }
    })

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword()
      return
    }
    navigate('/reset-password')
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ width: '100%' }}>
      <Stack gap="md">
        <Input
          label="E-mail"
          name="email"
          type="email"
          placeholder="seu.email@exemplo.com"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
          leftIcon={<TbMail size={18} />}
          required
        />

        <Input
          label="Senha"
          name="password"
          type="password"
          placeholder="Digite sua senha"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
          leftIcon={<TbLock size={18} />}
          required
        />

        <Group justify="flex-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleForgotPassword}
            style={{ padding: 0, height: 'auto', fontSize: '13px', color: '#818cf8' }}
          >
            Esqueceu sua senha?
          </Button>
        </Group>

        <Box mt="xs">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            leftIcon={<TbLogin size={18} />}
          >
            Entrar na Plataforma
          </Button>
        </Box>
      </Stack>
    </form>
  )
}

export default LoginForm
