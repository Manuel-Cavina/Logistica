import { TransporterVerificationStatus } from '@logistica/database';
import { z } from 'zod';

export const GetAdminTransportersQuerySchema = z
  .object({
    status: z.nativeEnum(TransporterVerificationStatus).optional(),
  })
  .strict();

export type GetAdminTransportersQueryDto = z.infer<
  typeof GetAdminTransportersQuerySchema
>;
