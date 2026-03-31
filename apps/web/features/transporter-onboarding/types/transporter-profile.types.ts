import {
  TransporterProfileViewSchema,
  TransporterVerificationStatusSchema,
} from "@logistica/shared";
import { z } from "zod";

export const TransporterProfileSchema = TransporterProfileViewSchema.extend({
  verificationStatus: TransporterVerificationStatusSchema,
});

export type TransporterVerificationStatus = z.infer<
  typeof TransporterVerificationStatusSchema
>;

export type TransporterProfile = z.infer<typeof TransporterProfileSchema>;
