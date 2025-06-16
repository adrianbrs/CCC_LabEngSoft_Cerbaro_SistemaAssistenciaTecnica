import { z } from "zod";

export const BrandSchema = z
  .object({
    name: z
      .string()
      .nonempty("Informe o nome da marca")
      .min(2, "O nome deve ter pelo menos 2 caracteres")
      .max(100, "O nome deve ter no máximo 100 caracteres"),
    phone: z
      .string()
      .nonempty("Informe um telefone para contato")
      .transform(sanitizeNumberStr)
      .refine((value) => value.length >= 10, {
        message: "Número de telefone inválido",
      }),
    email: z
      .string()
      .nonempty("Informe um e-mail para contato")
      .email("E-mail inválido"),
  })
  .strip();

export type BrandFormData = z.output<typeof BrandSchema>;
