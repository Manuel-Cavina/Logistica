import type { TransporterVerificationStatus } from '@logistica/database';

export class AdminTransporterDetailResponseDto {
  id!: string;
  displayName!: string;
  businessName!: string | null;
  contactPhone!: string | null;
  bio!: string | null;
  maxDetourKmDefault!: number | null;
  verificationStatus!: TransporterVerificationStatus;
}
