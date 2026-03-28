import { LoginSchema, RegisterSchema } from "@logistica/shared";
import type { z } from "zod";

export const loginSchema = LoginSchema;
export const registerSchema = RegisterSchema;

export type LoginSchemaValues = z.infer<typeof loginSchema>;
export type RegisterSchemaValues = z.infer<typeof registerSchema>;
