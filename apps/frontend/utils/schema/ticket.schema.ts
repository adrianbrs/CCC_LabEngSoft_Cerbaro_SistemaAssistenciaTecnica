import { TicketStatus } from "@musat/core";
import { z } from "zod";

export const TicketCreateSchema = z
  .object({
    productId: z
      .string({
        message: "Selecione um produto",
      })
      .nonempty("Selecione um produto")
      .uuid("ID inválido"),
    description: z
      .string()
      .nonempty("Informe a descrição do problema")
      .min(10, "A descrição deve ter pelo menos 10 caracteres")
      .max(1000, "A descrição deve ter no máximo 1000 caracteres"),
    serialNumber: z
      .string()
      .nonempty("Informe o código do produto")
      .max(500, "O código deve ter no máximo 500 caracteres"),
  })
  .strip();

export type TicketCreateFormData = z.output<typeof TicketCreateSchema>;

export const TicketUpdateSchema = z
  .object({
    status: z.nativeEnum(TicketStatus, {
      message: "Selecione um status válido",
    }),
  })
  .strip();

export type TicketUpdateFormData = z.output<typeof TicketUpdateSchema>;
