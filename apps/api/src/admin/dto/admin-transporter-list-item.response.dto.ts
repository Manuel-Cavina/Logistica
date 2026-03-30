import type { TransporterVerificationStatus } from '@logistica/database';

export class AdminTransporterListItemResponseDto {
  id!: string;
  displayName!: string;
  contactPhone!: string | null;
  verificationStatus!: TransporterVerificationStatus;
}
