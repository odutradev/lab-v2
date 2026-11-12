import { z } from "zod";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emailSchema = z.string().min(1, "E-mail é obrigatório").regex(emailPattern, "E-mail inválido");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Senha é obrigatória")
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .refine((name) => name.trim().length >= 3, "Nome deve ter no mínimo 3 caracteres"),
  email: emailSchema,
  password: z.string().min(1, "Senha é obrigatória").min(8, "Senha deve ter no mínimo 8 caracteres")
});

export const resetEmailSchema = z.object({
  email: z.string().min(1, "E-mail é obrigatório").regex(emailPattern, "E-mail inválido")
});

export const verificationCodeSchema = z.object({
  code: z.string().min(1, "Código é obrigatório").length(6, "O código deve conter exatamente 6 dígitos")
});

export const newPasswordSchema = z
  .object({
    password: z.string().min(1, "Nova senha é obrigatória").min(8, "A senha deve conter no mínimo 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória")
  })
  .refine((values) => !values.confirmPassword || values.confirmPassword === values.password, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
    when: () => true
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
