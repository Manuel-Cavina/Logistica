import {
  Prisma,
  type TransporterVerificationStatus,
} from '@logistica/database';

export interface ListAdminTransportersFilters {
  status?: TransporterVerificationStatus;
}

export const adminTransporterListSelect =
  Prisma.validator<Prisma.TransporterProfileSelect>()({
    id: true,
    displayName: true,
    contactPhone: true,
    verificationStatus: true,
  });

export type AdminTransporterListRecord = Prisma.TransporterProfileGetPayload<{
  select: typeof adminTransporterListSelect;
}>;
