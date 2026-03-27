import { RegisterSchema } from "@logistica/shared";
import type { z } from "zod";

export const registerSchema = RegisterSchema;
export type RegisterSchemaValues = z.infer<typeof registerSchema>;
