import { z } from "zod";
import {
  LoginSchema,
  RegisterSchema,
  RegisterClientSchema,
  RegisterTransporterSchema,
} from "../schemas/auth.schema";

const emailSchema = z.string().trim().email().max(320);
const cuidSchema = z.string().cuid();

export const AccountRoleSchema = z.enum(["CLIENT", "TRANSPORTER", "ADMIN"]);
export type AccountRole = z.infer<typeof AccountRoleSchema>;

export const RegisterClientDtoSchema = RegisterClientSchema;
export type IRegisterClientDto = z.infer<typeof RegisterClientDtoSchema>;

export const RegisterTransporterDtoSchema = RegisterTransporterSchema;
export type IRegisterTransporterDto = z.infer<
  typeof RegisterTransporterDtoSchema
>;

export const RegisterDtoSchema = RegisterSchema;
export type IRegisterDto = z.infer<typeof RegisterDtoSchema>;

export const LoginDtoSchema = LoginSchema;
export type ILoginDto = z.infer<typeof LoginDtoSchema>;

export const AuthAccountSchema = z.object({
  id: cuidSchema,
  email: emailSchema,
  role: AccountRoleSchema,
  isEmailVerified: z.boolean(),
});
export type IAuthAccount = z.infer<typeof AuthAccountSchema>;

export const UserProfileViewSchema = z.object({
  id: cuidSchema,
  firstName: z.string().trim().min(1).max(120),
  lastName: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(1).max(32).nullable(),
});
export type IUserProfileView = z.infer<typeof UserProfileViewSchema>;

export const TransporterProfileViewSchema = z.object({
  id: cuidSchema,
  displayName: z.string().trim().min(1).max(160),
});
export type ITransporterProfileView = z.infer<
  typeof TransporterProfileViewSchema
>;

export const AuthProfileViewSchema = z
  .union([UserProfileViewSchema, TransporterProfileViewSchema])
  .nullable();
export type IAuthProfileView = z.infer<typeof AuthProfileViewSchema>;

export const LoginResponseSchema = z.object({
  account: AuthAccountSchema,
  accessToken: z.string().min(1),
});
export type ILoginResponse = z.infer<typeof LoginResponseSchema>;

export const RefreshResponseSchema = z.object({
  accessToken: z.string().min(1),
});
export type IRefreshResponse = z.infer<typeof RefreshResponseSchema>;

export const RegisterResponseSchema = z.object({
  account: AuthAccountSchema,
});
export type IRegisterResponse = z.infer<typeof RegisterResponseSchema>;

export const MeResponseSchema = AuthAccountSchema.pick({
  id: true,
  email: true,
  role: true,
});
export type IMeResponse = z.infer<typeof MeResponseSchema>;
