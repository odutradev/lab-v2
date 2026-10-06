import { TbMail, TbLock, TbUser, TbUserPlus } from 'react-icons/tb'
import { Stack, Box } from '@mantine/core'

import Button from '@components/ui/button'
import Input from '@components/ui/input'
import useToast from '@hooks/useToast'
import useAuth from '@hooks/useAuth'
import useForm from '@hooks/useForm'

import type { RegisterFormValues } from './types'
import type { ApiError } from '@projectTypes/api'

export const RegisterForm = () => {
  const { register } = useAuth()
  const { showToast } = useToast()

  const { values, errors, isSubmitting, handleChange, handleBlur, handleSubmit } =
    useForm<RegisterFormValues>({
      initialValues: {
        name: '',
        email: '',
        password: ''
      },
      validationRules: {
        name: (val) => {
          if (!val) return 'Nome é obrigatório'
          if (val.trim().length < 3) return 'Nome deve ter no mínimo 3 caracteres'
          return undefined
        },
        email: (val) => {
          if (!val) return 'E-mail é obrigatório'
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'E-mail inválido'
          return undefined
        },
        password: (val) => {
          if (!val) return 'Senha é obrigatória'
          if (val.length < 8) return 'Senha deve ter no mínimo 8 caracteres'
          return undefined
        }
      },
      onSubmit: async (formValues) => {
        try {
          await register({
            name: formValues.name.trim(),
            email: formValues.email.trim(),
            password: formValues.password
          })
          showToast('Conta criada com sucesso!', 'success')
        } catch (err) {
          const apiErr = err as ApiError
          showToast(apiErr.message || 'Falha ao realizar cadastro', 'error', 'Erro no cadastro')
        }
      }
    })

  return (
    <form onSubmit={handleSubmit} noValidate style={{ width: '100%' }}>
      <Stack gap="md">
        <Input
          label="Nome Completo"
          name="name"
          placeholder="João da Silva"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.name}
          leftIcon={<TbUser size={18} />}
          required
        />

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
          placeholder="Mínimo 8 caracteres"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
          leftIcon={<TbLock size={18} />}
          required
        />

        <Box mt="xs">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            leftIcon={<TbUserPlus size={18} />}
          >
            Criar Nova Conta
          </Button>
        </Box>
      </Stack>
    </form>
  )
}

export default RegisterForm
