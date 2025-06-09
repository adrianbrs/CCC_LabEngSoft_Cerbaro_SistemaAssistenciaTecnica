import { z } from "zod";

export const AddressSchema = z.object({
  street: z.string().min(3, "A rua deve ter pelo menos 3 caracteres").max(100),
  number: z.string().max(10).nullish(),
  neighborhood: z
    .string()
    .min(3, "O bairro deve ter pelo menos 3 caracteres")
    .max(100),
  complement: z.string().max(255).nullish(),
  city: z.string().min(3, "A cidade deve ter pelo menos 3 caracteres").max(64),
  state: z.string().length(2, "O estado deve ter exatamente 2 caracteres"),
  zipCode: z
    .string()
    .refine((value) => /^\d{5}-\d{3}$/.test(value), {
      message: "Informe um CEP válido",
    })
    .transform(sanitizeNumberStr),
});

export type AddressFormData = z.output<typeof AddressSchema>;
