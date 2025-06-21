import { UserRole } from "@musat/core";
import { z } from "zod";

export const UserUpdateSchema = z
  .object({
    role: z.nativeEnum(UserRole, {
      message: "Cargo inválido",
    }),
  })
  .strip()
  .partial();

export type UserUpdateFormData = z.output<typeof UserUpdateSchema>;
