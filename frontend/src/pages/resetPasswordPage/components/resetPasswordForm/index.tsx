import { TbMail, TbLock, TbKey, TbCheck, TbArrowLeft, TbSend, TbRefresh } from 'react-icons/tb'
import { Stack, Box, Group, Text, ThemeIcon, Paper } from '@mantine/core'
import { useState, type FormEvent } from 'react'

import { requestCodeAction, verifyCodeAction } from '@actions/users/validation'
import { resetPasswordAction } from '@actions/users/profile'
import useToastStore from '@stores/toast'
import Button from '@components/ui/button'
import Input from '@components/ui/input'

import type { ResetPasswordFormProps, ResetPasswordStep } from './types'
import type { ApiError } from '@projectTypes/api'

export const ResetPasswordForm = ({ initialEmail, onSuccess, onCancel }: ResetPasswordFormProps) => {
  const { showToast } = useToastStore()

  const [step, setStep] = useState<ResetPasswordStep>('email')
  const [email, setEmail] = useState<string>(initialEmail || '')
  const [code, setCode] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [resetToken, setResetToken] = useState<string>('')

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [emailError, setEmailError] = useState<string | undefined>()
  const [codeError, setCodeError] = useState<string | undefined>()
  const [passwordError, setPasswordError] = useState<string | undefined>()
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>()

  const isEmailPredefined = !!initialEmail

  const handleRequestCode = async (e?: FormEvent) => {
    if (e) e.preventDefault()

    const targetEmail = email.trim()
    if (!targetEmail) {
      setEmailError('E-mail é obrigatório')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      setEmailError('E-mail inválido')
      return
    }

    setEmailError(undefined)
    setIsLoading(true)

    try {
      await requestCodeAction('password_reset', { email: targetEmail })
      showToast('Código de verificação enviado com sucesso!', 'success')
      setStep('code')
    } catch (err) {
      const apiErr = err as ApiError
      showToast(apiErr.message || 'Falha ao solicitar código', 'error', 'Erro na verificação')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: FormEvent) => {
    e.preventDefault()

    const targetCode = code.trim()
    if (!targetCode) {
      setCodeError('Código é obrigatório')
      return
    }

    if (targetCode.length !== 6) {
      setCodeError('O código deve conter exatamente 6 dígitos')
      return
    }

    setCodeError(undefined)
    setIsLoading(true)

    try {
      const response = await verifyCodeAction('password_reset', {
        email: email.trim(),
        code: targetCode
      })

      if (!response.resetToken) {
        throw new Error('Token de redefinição não retornado pelo servidor')
      }

      setResetToken(response.resetToken)
      showToast('Código verificado com sucesso!', 'success')
      setStep('password')
    } catch (err) {
      const apiErr = err as ApiError
      showToast(apiErr.message || 'Código de verificação inválido ou expirado', 'error', 'Erro na validação')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault()

    let hasError = false

    if (!password) {
      setPasswordError('Nova senha é obrigatória')
      hasError = true
    } else if (password.length < 8) {
      setPasswordError('A senha deve conter no mínimo 8 caracteres')
      hasError = true
    } else {
      setPasswordError(undefined)
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Confirmação de senha é obrigatória')
      hasError = true
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('As senhas não coincidem')
      hasError = true
    } else {
      setConfirmPasswordError(undefined)
    }

    if (hasError) return

    setIsLoading(true)

    try {
      await resetPasswordAction({
        token: resetToken,
        password
      })

      showToast('Senha redefinida com sucesso!', 'success')
      setStep('success')
    } catch (err) {
      const apiErr = err as ApiError
      showToast(apiErr.message || 'Falha ao redefinir senha', 'error', 'Erro na redefinição')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <Stack align="center" gap="lg" py="md" w="100%">
        <ThemeIcon size={64} radius="xl" color="teal" variant="light">
          <TbCheck size={36} />
        </ThemeIcon>

        <Stack align="center" gap="xs" ta="center">
          <Text size="lg" fw={700} c="white">
            Senha redefinida com sucesso!
          </Text>
          <Text size="sm" c="dimmed" maw={360}>
            Sua nova senha já está ativa. Você já pode utilizá-la em seus próximos acessos.
          </Text>
        </Stack>

        {onSuccess && (
          <Box w="100%" mt="sm">
            <Button variant="primary" size="lg" fullWidth onClick={onSuccess}>
              Concluir
            </Button>
          </Box>
        )}
      </Stack>
    )
  }

  if (step === 'code') {
    return (
      <form onSubmit={handleVerifyCode} noValidate style={{ width: '100%' }}>
        <Stack gap="md">
          <Paper p="sm" radius="md" bg="rgba(99, 102, 241, 0.08)" withBorder style={{ borderColor: 'rgba(99, 102, 241, 0.2)' }}>
            <Text size="xs" c="indigo.2">
              Código de verificação enviado para <b>{email}</b>. Verifique sua caixa de entrada.
            </Text>
          </Paper>

          <Input
            label="Código de Verificação"
            name="code"
            type="text"
            placeholder="Digite o código de 6 dígitos"
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
              if (codeError) setCodeError(undefined)
            }}
            error={codeError}
            leftIcon={<TbKey size={18} />}
            maxLength={6}
            required
          />

          <Box mt="xs">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              leftIcon={<TbCheck size={18} />}
            >
              Validar Código
            </Button>
          </Box>

          <Group justify="space-between" mt="xs">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRequestCode()}
              disabled={isLoading}
              leftIcon={<TbRefresh size={14} />}
            >
              Reenviar código
            </Button>

            {!isEmailPredefined && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStep('email')}
                disabled={isLoading}
                leftIcon={<TbArrowLeft size={14} />}
              >
                Alterar e-mail
              </Button>
            )}
          </Group>
        </Stack>
      </form>
    )
  }

  if (step === 'password') {
    return (
      <form onSubmit={handleResetPassword} noValidate style={{ width: '100%' }}>
        <Stack gap="md">
          <Input
            label="Nova Senha"
            name="password"
            type="password"
            placeholder="No mínimo 8 caracteres"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (passwordError) setPasswordError(undefined)
            }}
            error={passwordError}
            leftIcon={<TbLock size={18} />}
            required
          />

          <Input
            label="Confirmar Nova Senha"
            name="confirmPassword"
            type="password"
            placeholder="Confirme sua nova senha"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (confirmPasswordError) setConfirmPasswordError(undefined)
            }}
            error={confirmPasswordError}
            leftIcon={<TbLock size={18} />}
            required
          />

          <Box mt="xs">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              leftIcon={<TbCheck size={18} />}
            >
              Salvar Nova Senha
            </Button>
          </Box>
        </Stack>
      </form>
    )
  }

  return (
    <form onSubmit={handleRequestCode} noValidate style={{ width: '100%' }}>
      <Stack gap="md">
        {isEmailPredefined ? (
          <Paper
            p="md"
            radius="md"
            bg="rgba(99, 102, 241, 0.08)"
            withBorder
            style={{ borderColor: 'rgba(99, 102, 241, 0.25)' }}
          >
            <Stack gap="xs">
              <Text size="xs" c="dimmed">
                O código de verificação será enviado para o endereço associado à sua conta:
              </Text>
              <Group gap="xs">
                <ThemeIcon size="sm" variant="light" color="indigo" radius="sm">
                  <TbMail size={14} />
                </ThemeIcon>
                <Text size="sm" fw={600} c="white">
                  {initialEmail}
                </Text>
              </Group>
            </Stack>
          </Paper>
        ) : (
          <Input
            label="E-mail Cadastrado"
            name="email"
            type="email"
            placeholder="seu.email@exemplo.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (emailError) setEmailError(undefined)
            }}
            error={emailError}
            leftIcon={<TbMail size={18} />}
            required
          />
        )}

        <Box mt="xs">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            leftIcon={<TbSend size={18} />}
          >
            {isEmailPredefined ? 'Enviar Código para Meu E-mail' : 'Enviar Código de Recuperação'}
          </Button>
        </Box>

        {onCancel && (
          <Box ta="center" mt="xs">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              leftIcon={<TbArrowLeft size={14} />}
            >
              Voltar
            </Button>
          </Box>
        )}
      </Stack>
    </form>
  )
}

export default ResetPasswordForm
