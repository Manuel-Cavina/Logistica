import { z } from 'zod';

export const UpdateAdminTransporterVerificationStatusSchema = z
  .object({
    verificationStatus: z.enum(['VERIFIED', 'REJECTED']),
  })
  .strict();

export type UpdateAdminTransporterVerificationStatusDto = z.infer<
  typeof UpdateAdminTransporterVerificationStatusSchema
>;
