import { TbMail, TbLock, TbUser, TbUserPlus } from "react-icons/tb";
import { Stack, Box } from "@mantine/core";

import Button from "@components/button";
import Input from "@components/input";
import useAuthStore from "@stores/auth";
import useAction from "@hooks/useAction";
import { registerSchema } from "@utils/validations/auth";
import useForm from "@hooks/useForm";

import type { RegisterFormValues } from "./types";

export const RegisterForm = () => {
  const { register } = useAuthStore();
  const runAction = useAction();

  const { values, errors, isSubmitting, handleChange, handleBlur, handleSubmit } = useForm<RegisterFormValues>({
    initialValues: {
      name: "",
      email: "",
      password: ""
    },
    schema: registerSchema,
    onSubmit: async (formValues) => {
      await runAction({
        action: () =>
          register({
            name: formValues.name.trim(),
            email: formValues.email.trim(),
            password: formValues.password
          }),
        toastMessages: {
          success: "Conta criada com sucesso!",
          error: "Falha ao realizar cadastro",
          errorTitle: "Erro no cadastro",
          preferApiErrorMessage: true
        }
      });
    }
  });

  return (
    <form onSubmit={handleSubmit} noValidate style={{ width: "100%" }}>
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
  );
};

export default RegisterForm;
