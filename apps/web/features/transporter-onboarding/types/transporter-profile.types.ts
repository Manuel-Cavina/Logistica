import { TransporterProfileViewSchema } from "@logistica/shared";
import { z } from "zod";

export const TransporterVerificationStatusSchema = z.enum([
  "INCOMPLETE",
  "PENDING",
  "VERIFIED",
  "REJECTED",
]);

export const TransporterProfileSchema = TransporterProfileViewSchema.extend({
  verificationStatus: TransporterVerificationStatusSchema,
});

export type TransporterVerificationStatus = z.infer<
  typeof TransporterVerificationStatusSchema
>;

export type TransporterProfile = z.infer<typeof TransporterProfileSchema>;
