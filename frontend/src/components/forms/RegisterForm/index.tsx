import { Mail, Lock, User, UserPlus, Phone, FileText } from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth'
import { useToast } from '../../../hooks/useToast'
import { useForm } from '../../../hooks/useForm'
import { Input } from '../../ui/Input'
import { Select } from '../../ui/Select'
import { Button } from '../../ui/Button'
import type { ApiError } from '../../../types/api'
import type { RegisterFormValues } from './types'
import styles from '../forms.module.css'

export const RegisterForm = () => {
  const { register } = useAuth()
  const { showToast } = useToast()

  const { values, errors, isSubmitting, handleChange, handleBlur, handleSubmit } =
    useForm<RegisterFormValues>({
      initialValues: {
        name: '',
        email: '',
        password: '',
        accountType: 'tenant',
        document: '',
        phone: ''
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
        },
        accountType: (val) => {
          if (!val) return 'Selecione o tipo de conta'
          return undefined
        }
      },
      onSubmit: async (formValues) => {
        try {
          await register({
            name: formValues.name.trim(),
            email: formValues.email.trim(),
            password: formValues.password,
            accountType: formValues.accountType,
            document: formValues.document.trim() || undefined,
            phone: formValues.phone.trim() || undefined
          })
          showToast('Conta criada com sucesso!', 'success')
        } catch (err) {
          const apiErr = err as ApiError
          showToast(apiErr.message || 'Falha ao realizar cadastro', 'error', 'Erro no cadastro')
        }
      }
    })

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Input
        label="Nome Completo"
        name="name"
        placeholder="João da Silva"
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.name}
        leftIcon={<User size={18} />}
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
        leftIcon={<Mail size={18} />}
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
        leftIcon={<Lock size={18} />}
        required
      />

      <Select
        label="Tipo de Conta"
        name="accountType"
        value={values.accountType}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.accountType}
        options={[
          { value: 'tenant', label: 'Inquilino / Morador' },
          { value: 'owner', label: 'Proprietário de Imóvel' }
        ]}
        required
      />

      <div className={styles.row}>
        <Input
          label="Documento (CPF / CNPJ)"
          name="document"
          placeholder="Opcional"
          value={values.document}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.document}
          leftIcon={<FileText size={18} />}
        />

        <Input
          label="Telefone / WhatsApp"
          name="phone"
          placeholder="Opcional"
          value={values.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.phone}
          leftIcon={<Phone size={18} />}
        />
      </div>

      <div className={styles.actions}>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          leftIcon={<UserPlus size={18} />}
        >
          Criar Nova Conta
        </Button>
      </div>
    </form>
  )
}
