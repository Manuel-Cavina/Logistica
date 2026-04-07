import { z } from "zod";
import {
  LoginSchema,
  RegisterSchema,
  RegisterClientSchema,
  RegisterTransporterSchema,
} from "../schemas/auth.schema";
import { CreateVehicleSchema } from "../schemas/vehicle.schema";

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

export const TransporterVerificationStatusSchema = z.enum([
  "INCOMPLETE",
  "PENDING",
  "VERIFIED",
  "REJECTED",
]);
export type ITransporterVerificationStatus = z.infer<
  typeof TransporterVerificationStatusSchema
>;

export const TransporterProfileViewSchema = z.object({
  id: cuidSchema,
  displayName: z.string().trim().min(1).max(160),
  businessName: z.string().trim().min(1).max(160).nullable(),
  contactPhone: z.string().trim().min(1).max(32).nullable(),
  bio: z.string().trim().min(1).max(1000).nullable(),
  maxDetourKmDefault: z.number().int().min(0).max(1000).nullable(),
});
export type ITransporterProfileView = z.infer<
  typeof TransporterProfileViewSchema
>;

export const VehicleViewSchema = z.object({
  id: cuidSchema,
  licensePlate: z.string().trim().min(1).max(8),
  brand: z.string().trim().min(1).max(80),
  model: z.string().trim().min(1).max(80),
  isActive: z.boolean(),
});
export type IVehicleView = z.infer<typeof VehicleViewSchema>;

export type IUpdateTransporterProfileDto = {
  displayName?: string;
  businessName?: string | null;
  contactPhone?: string | null;
  bio?: string | null;
  maxDetourKmDefault?: number | null;
};

export const CreateVehicleDtoSchema = CreateVehicleSchema;
export type ICreateVehicleDto = z.infer<typeof CreateVehicleDtoSchema>;

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
