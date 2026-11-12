import { TbMail, TbLock, TbLogin } from "react-icons/tb";
import { Stack, Box, Group } from "@mantine/core";
import { useNavigate } from "react-router-dom";

import useAuthStore from "@stores/auth";
import useAction from "@hooks/useAction";
import { loginSchema } from "@utils/validations/auth";
import Button from "@components/button";
import Input from "@components/input";
import useForm from "@hooks/useForm";

import type { LoginFormValues, LoginFormProps } from "./types";
import { colors } from "@styles/theme";

export const LoginForm = ({ onForgotPassword }: LoginFormProps) => {
  const { login } = useAuthStore();
  const runAction = useAction();
  const navigate = useNavigate();

  const { values, errors, isSubmitting, handleChange, handleBlur, handleSubmit } = useForm<LoginFormValues>({
    initialValues: {
      email: "",
      password: ""
    },
    schema: loginSchema,
    onSubmit: async (formValues) => {
      await runAction({
        action: () => login(formValues),
        toastMessages: {
          success: "Login realizado com sucesso!",
          error: "Falha ao autenticar",
          errorTitle: "Erro no login",
          preferApiErrorMessage: true
        }
      });
    }
  });

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
      return;
    }
    navigate("/reset-password");
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ width: "100%" }}>
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
            style={{ padding: 0, height: "auto", fontSize: "13px", color: colors.indigo400 }}
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
  );
};

export default LoginForm;
