import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Ingresa tu email.")
  .email("Ingresa un email valido.")
  .max(320, "El email no puede superar los 320 caracteres.");
const passwordSchema = z
  .string()
  .min(8, "La contrasena debe tener entre 8 y 128 caracteres.")
  .max(128, "La contrasena debe tener entre 8 y 128 caracteres.");
const nonEmptyStringSchema = z
  .string()
  .trim()
  .min(1, "Este campo es obligatorio.");
const optionalPhoneSchema = z
  .string()
  .trim()
  .max(32, "Ingresa un telefono valido o deja el campo vacio.")
  .optional()
  .refine(
    (value) => value === undefined || value.length > 0,
    "Ingresa un telefono valido o deja el campo vacio.",
  );
export const PublicRegisterRoleSchema = z.enum(["CLIENT", "TRANSPORTER"]);

export const RegisterClientSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nonEmptyStringSchema.min(1, "Ingresa el nombre de la persona responsable."),
  lastName: nonEmptyStringSchema.min(1, "Ingresa el apellido de la persona responsable."),
  phone: optionalPhoneSchema,
});

export const RegisterTransporterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: nonEmptyStringSchema.min(
    1,
    "Ingresa el nombre comercial o identificador del transportista.",
  ),
});

export const RegisterSchema = z.discriminatedUnion("role", [
  RegisterClientSchema.extend({
    role: z.literal(PublicRegisterRoleSchema.enum.CLIENT),
  }),
  RegisterTransporterSchema.extend({
    role: z.literal(PublicRegisterRoleSchema.enum.TRANSPORTER),
  }),
]);

export const LoginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(6, "La contrasena debe tener al menos 6 caracteres.")
    .max(128, "La contrasena no puede superar los 128 caracteres."),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type RegisterClientDto = z.infer<typeof RegisterClientSchema>;
export type RegisterTransporterDto = z.infer<typeof RegisterTransporterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
