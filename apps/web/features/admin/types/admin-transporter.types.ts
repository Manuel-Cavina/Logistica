import { TransporterVerificationStatusSchema } from "@logistica/shared";
import { z } from "zod";

export const AdminTransporterListItemSchema = z.object({
  id: z.string().cuid(),
  displayName: z.string().trim().min(1).max(160),
  contactPhone: z.string().trim().min(1).max(32).nullable(),
  verificationStatus: TransporterVerificationStatusSchema,
});

export const AdminTransportersListSchema = z.array(AdminTransporterListItemSchema);

export type AdminTransporterListItem = z.infer<
  typeof AdminTransporterListItemSchema
>;
