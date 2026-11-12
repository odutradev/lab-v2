import { TbMail, TbLock, TbKey, TbCheck, TbArrowLeft, TbSend, TbRefresh } from "react-icons/tb";
import { Stack, Box, Group, Text, ThemeIcon, Paper, alpha } from "@mantine/core";
import { useState, type FormEvent } from "react";

import { requestCodeAction, verifyCodeAction } from "@actions/users/validation";
import { resetPasswordAction } from "@actions/users/profile";
import { resetEmailSchema, verificationCodeSchema, newPasswordSchema } from "@utils/validations/auth";
import { getFormErrors } from "@utils/validations";
import useAction from "@hooks/useAction";
import Button from "@components/button";
import Input from "@components/input";

import type { ResetPasswordFormProps, ResetPasswordStep } from "./types";
import { colors, tokens } from "@styles/theme";

export const ResetPasswordForm = ({ initialEmail, onSuccess, onCancel }: ResetPasswordFormProps) => {
  const runAction = useAction();

  const [step, setStep] = useState<ResetPasswordStep>("email");
  const [email, setEmail] = useState<string>(initialEmail || "");
  const [code, setCode] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [resetToken, setResetToken] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [codeError, setCodeError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>();

  const isEmailPredefined = !!initialEmail;

  const handleRequestCode = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    const targetEmail = email.trim();
    const { email: emailValidationError } = getFormErrors(resetEmailSchema, { email: targetEmail });
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    setEmailError(undefined);
    setIsLoading(true);

    await runAction({
      action: () => requestCodeAction("password_reset", { email: targetEmail }),
      toastMessages: {
        success: "Código de verificação enviado com sucesso!",
        error: "Falha ao solicitar código",
        errorTitle: "Erro na verificação",
        preferApiErrorMessage: true
      },
      callback: () => setStep("code")
    });

    setIsLoading(false);
  };

  const handleVerifyCode = async (e: FormEvent) => {
    e.preventDefault();

    const targetCode = code.trim();
    const { code: codeValidationError } = getFormErrors(verificationCodeSchema, { code: targetCode });
    if (codeValidationError) {
      setCodeError(codeValidationError);
      return;
    }

    setCodeError(undefined);
    setIsLoading(true);

    await runAction({
      action: async () => {
        const response = await verifyCodeAction("password_reset", { email: email.trim(), code: targetCode });
        if (!response.resetToken) throw new Error("Token de redefinição não retornado pelo servidor");
        return response.resetToken;
      },
      toastMessages: {
        success: "Código verificado com sucesso!",
        error: "Código de verificação inválido ou expirado",
        errorTitle: "Erro na validação",
        preferApiErrorMessage: true
      },
      callback: (token) => {
        setResetToken(token);
        setStep("password");
      }
    });

    setIsLoading(false);
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();

    const validationErrors = getFormErrors(newPasswordSchema, { password, confirmPassword });
    setPasswordError(validationErrors.password);
    setConfirmPasswordError(validationErrors.confirmPassword);

    if (validationErrors.password || validationErrors.confirmPassword) return;

    setIsLoading(true);

    await runAction({
      action: () => resetPasswordAction({ token: resetToken, password }),
      toastMessages: {
        success: "Senha redefinida com sucesso!",
        error: "Falha ao redefinir senha",
        errorTitle: "Erro na redefinição",
        preferApiErrorMessage: true
      },
      callback: () => setStep("success")
    });

    setIsLoading(false);
  };

  if (step === "success") {
    return (
      <Stack align="center" gap="lg" py="md" w="100%">
        <ThemeIcon size={64} radius="xl" color="teal" variant="light">
          <TbCheck size={36} />
        </ThemeIcon>

        <Stack align="center" gap="xs" ta="center">
          <Text size="lg" fw={600} c={tokens.textPrimary}>
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
    );
  }

  if (step === "code") {
    return (
      <form onSubmit={handleVerifyCode} noValidate style={{ width: "100%" }}>
        <Stack gap="md">
          <Paper
            p="sm"
            radius="md"
            bg={alpha(colors.indigo500, 0.08)}
            withBorder
            style={{ borderColor: alpha(colors.indigo500, 0.2) }}
          >
            <Text size="xs" c="indigo.2">
              Código de verificação enviado para <b>{email}</b>. Verifique sua caixa de entrada.
            </Text>
          </Paper>

          <Input
            label="Código de verificação"
            name="code"
            type="text"
            placeholder="Digite o código de 6 dígitos"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (codeError) setCodeError(undefined);
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
              Validar código
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
                onClick={() => setStep("email")}
                disabled={isLoading}
                leftIcon={<TbArrowLeft size={14} />}
              >
                Alterar e-mail
              </Button>
            )}
          </Group>
        </Stack>
      </form>
    );
  }

  if (step === "password") {
    return (
      <form onSubmit={handleResetPassword} noValidate style={{ width: "100%" }}>
        <Stack gap="md">
          <Input
            label="Nova senha"
            name="password"
            type="password"
            placeholder="No mínimo 8 caracteres"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError(undefined);
            }}
            error={passwordError}
            leftIcon={<TbLock size={18} />}
            required
          />

          <Input
            label="Confirmar nova senha"
            name="confirmPassword"
            type="password"
            placeholder="Confirme sua nova senha"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (confirmPasswordError) setConfirmPasswordError(undefined);
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
              Salvar nova senha
            </Button>
          </Box>
        </Stack>
      </form>
    );
  }

  return (
    <form onSubmit={handleRequestCode} noValidate style={{ width: "100%" }}>
      <Stack gap="md">
        {isEmailPredefined ? (
          <Paper
            p="md"
            radius="md"
            bg={alpha(colors.indigo500, 0.08)}
            withBorder
            style={{ borderColor: alpha(colors.indigo500, 0.25) }}
          >
            <Stack gap="xs">
              <Text size="xs" c="dimmed">
                O código de verificação será enviado para o endereço associado à sua conta:
              </Text>
              <Group gap="xs">
                <ThemeIcon size="sm" variant="light" color="indigo" radius="sm">
                  <TbMail size={14} />
                </ThemeIcon>
                <Text size="sm" fw={600} c={tokens.textPrimary}>
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
              setEmail(e.target.value);
              if (emailError) setEmailError(undefined);
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
            {isEmailPredefined ? "Enviar Código para Meu E-mail" : "Enviar Código de Recuperação"}
          </Button>
        </Box>

        {onCancel && (
          <Box ta="center" mt="xs">
            <Button type="button" variant="ghost" size="sm" onClick={onCancel} leftIcon={<TbArrowLeft size={14} />}>
              Voltar
            </Button>
          </Box>
        )}
      </Stack>
    </form>
  );
};

export default ResetPasswordForm;
