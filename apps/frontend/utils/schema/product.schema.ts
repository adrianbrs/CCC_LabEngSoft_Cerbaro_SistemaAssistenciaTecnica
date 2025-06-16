import { z } from "zod";

export const ProductSchema = z
  .object({
    model: z
      .string()
      .nonempty("Informe o modelo do produto")
      .min(2, "O modelo deve ter pelo menos 2 caracteres")
      .max(100, "O modelo deve ter no máximo 100 caracteres"),
    brandId: z
      .string()
      .nonempty("Informe a marca do produto")
      .uuid("ID inválido"),
    categoryId: z
      .string()
      .nonempty("Informe a categoria do produto")
      .uuid("ID inválido"),
  })
  .strip();

export type ProductFormData = z.output<typeof ProductSchema>;
