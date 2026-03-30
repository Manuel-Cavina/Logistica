import type { Prisma, TransporterProfile } from '@logistica/database';
import type { IUpdateTransporterProfileDto } from '@logistica/shared';

export type UpdateTransporterProfileInput = IUpdateTransporterProfileDto;
export type TransporterProfileUpdateData = Prisma.TransporterProfileUpdateInput;

export type TransporterProfileRecord = TransporterProfile;
