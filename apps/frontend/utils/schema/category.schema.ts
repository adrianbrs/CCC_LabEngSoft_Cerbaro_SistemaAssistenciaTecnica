import { z } from "zod";

export const CategorySchema = z
  .object({
    name: z
      .string()
      .nonempty("Informe o nome da categoria")
      .min(2, "O nome deve ter pelo menos 2 caracteres")
      .max(100, "O nome deve ter no máximo 100 caracteres"),
  })
  .strip();

export type CategoryFormData = z.output<typeof CategorySchema>;
