import { Mail, Lock, LogIn } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { useForm } from '../../hooks/useForm'
import { Input } from '../ui/Input/Input'
import { Button } from '../ui/Button/Button'
import type { ApiError } from '../../types/api'
import styles from './forms.module.css'

interface LoginFormValues {
  email: string
  password: string
}

export const LoginForm = () => {
  const { login } = useAuth()
  const { showToast } = useToast()

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

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Input
        label="E-mail"
        name="email"
        type="email"
        placeholder="seu.email@exemplo.com"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.email}
        leftIcon={<Mail size={18} />}
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
        leftIcon={<Lock size={18} />}
        required
      />

      <div className={styles.actions}>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          leftIcon={<LogIn size={18} />}
        >
          Entrar na Plataforma
        </Button>
      </div>
    </form>
  )
}
