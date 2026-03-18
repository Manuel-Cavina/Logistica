import { z } from 'zod';

const emailSchema = z.string().trim().email().max(320);
const passwordSchema = z.string().min(8).max(128);
const nonEmptyStringSchema = z.string().trim().min(1);
const optionalPhoneSchema = z.string().trim().min(1).max(32).optional();
const optionalTextSchema = z.string().trim().min(1).max(255).optional();
const optionalBioSchema = z.string().trim().min(1).max(1000).optional();

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
  businessName: optionalTextSchema,
  contactPhone: optionalPhoneSchema,
  bio: optionalBioSchema,
});

export const LoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export type RegisterClientDto = z.infer<typeof RegisterClientSchema>;
export type RegisterTransporterDto = z.infer<typeof RegisterTransporterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
