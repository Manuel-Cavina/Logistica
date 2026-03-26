import { LoginSchema } from "@logistica/shared";
import type { z } from "zod";

export const loginSchema = LoginSchema;
export type LoginSchemaValues = z.infer<typeof loginSchema>;
