import { TransporterVerificationStatusSchema } from "@logistica/shared";
import { z } from "zod";

export const AdminTransporterListItemSchema = z.object({
  id: z.string().cuid(),
  displayName: z.string().trim().min(1).max(160),
  contactPhone: z.string().trim().min(1).max(32).nullable(),
  verificationStatus: TransporterVerificationStatusSchema,
});

export const AdminTransportersListSchema = z.array(AdminTransporterListItemSchema);

export const AdminTransporterDetailSchema = z.object({
  bio: z.string().trim().min(1).max(1000).nullable(),
  businessName: z.string().trim().min(1).max(160).nullable(),
  contactPhone: z.string().trim().min(1).max(32).nullable(),
  displayName: z.string().trim().min(1).max(160),
  id: z.string().cuid(),
  maxDetourKmDefault: z.number().int().min(0).max(1000).nullable(),
  verificationStatus: TransporterVerificationStatusSchema,
});

export const AdminTransporterVerificationDecisionSchema = z.enum([
  "VERIFIED",
  "REJECTED",
]);

export type AdminTransporterListItem = z.infer<
  typeof AdminTransporterListItemSchema
>;

export type AdminTransporterDetail = z.infer<
  typeof AdminTransporterDetailSchema
>;

export type AdminTransporterVerificationDecision = z.infer<
  typeof AdminTransporterVerificationDecisionSchema
>;
