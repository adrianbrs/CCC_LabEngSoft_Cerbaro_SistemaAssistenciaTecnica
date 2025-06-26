import { z } from "zod";
import { AddressSchema } from "./address.schema";

export const AccountPasswordSchema = z
  .string()
  .nonempty("A senha é obrigatória")
  .refine((value) => isStrongPassword(value), {
    message: "A senha não é forte o suficiente",
  });

export const AccountCreateSchema = z.object({
  name: z
    .string()
    .min(3, "O nome deve ter pelo menos 3 caracteres")
    .max(100, "O nome deve ter no máximo 100 caracteres")
    .regex(/[^\s]\s+[^\s]/, {
      message: "Por favor, informe seu nome completo",
    }),
  email: z.string().nonempty("Por favor, informe seu e-mail").email(),
  cpf: z
    .string()
    .nonempty("Por favor, informe seu CPF")
    .refine((value) => isValidCPF(value), {
      message: "O CPF informado é inválido",
    })
    .transform(sanitizeNumberStr),
  phone: z
    .string()
    .nonempty("Por favor, informe seu telefone")
    .transform(sanitizeNumberStr)
    .refine((value) => value.length >= 10, {
      message: "Número de telefone inválido",
    }),
  password: AccountPasswordSchema,
  address: AddressSchema,
});

export type AccountCreateFormData = z.output<typeof AccountCreateSchema>;

export const AccountUpdateSchema = AccountCreateSchema.omit({
  cpf: true,
})
  .extend({
    currentPassword: z.string().nonempty("Por favor, informe a senha atual"),
  })
  .partial({
    password: true,
    email: true,
    currentPassword: true,
  })
  .refine(
    ({ password, email, currentPassword }) =>
      (!password && !email) || currentPassword,
    {
      message: "Por favor, informe a senha atual",
      path: ["currentPassword"],
    }
  );

export type AccountUpdateFormData = z.output<typeof AccountUpdateSchema>;

export const AccountPasswordUpdateSchema = z
  .object({
    password: AccountPasswordSchema,
  })
  .extend({
    passwordConfirmation: z.string().nonempty("Por favor, confirme sua senha"),
  })
  .refine(
    ({ password, passwordConfirmation }) =>
      !password || password === passwordConfirmation,
    {
      message: "As senhas não coincidem",
      path: ["passwordConfirmation"],
    }
  );

export type AccountPasswordUpdateFormData = z.output<
  typeof AccountPasswordUpdateSchema
>;

export const AccountDeactivateSchema = z.object({
  currentPassword: z.string().nonempty("Por favor, informe sua senha"),
});

export type AccountDeactivateFormData = z.output<
  typeof AccountDeactivateSchema
>;

export const AccountPasswordResetSchema = z.object({
  token: z.string().nonempty("O token é obrigatório"),
  password: AccountPasswordSchema,
});

export type AccountPasswordResetFormData = z.output<
  typeof AccountPasswordResetSchema
>;
