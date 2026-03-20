import { z } from "zod";

const emailSchema = z.string().trim().email().max(320);
const passwordSchema = z.string().min(8).max(128);
const nonEmptyStringSchema = z.string().trim().min(1);
const optionalPhoneSchema = z.string().trim().min(1).max(32).optional();
export const PublicRegisterRoleSchema = z.enum(["CLIENT", "TRANSPORTER"]);

export const RegisterClientSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nonEmptyStringSchema,
  lastName: nonEmptyStringSchema,
  phone: optionalPhoneSchema,
});

export const RegisterTransporterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: nonEmptyStringSchema,
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
  password: z.string().min(1),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type RegisterClientDto = z.infer<typeof RegisterClientSchema>;
export type RegisterTransporterDto = z.infer<typeof RegisterTransporterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
