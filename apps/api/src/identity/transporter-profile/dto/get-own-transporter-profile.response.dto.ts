export class GetOwnTransporterProfileResponseDto {
  displayName!: string;
  businessName!: string | null;
  contactPhone!: string | null;
  bio!: string | null;
  maxDetourKmDefault!: number | null;
  verificationStatus!: 'INCOMPLETE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
}
