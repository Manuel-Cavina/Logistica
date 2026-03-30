import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  TransporterProfileRecord,
  UpdateTransporterProfileInput,
} from '../types/transporter-profile.types';
import { TransporterProfileRepository } from '../repositories/transporter-profile.repository';

@Injectable()
export class TransporterProfileService {
  constructor(
    private readonly transporterProfileRepository: TransporterProfileRepository,
  ) {}

  async updateOwnProfile(
    accountId: string,
    input: UpdateTransporterProfileInput,
  ): Promise<TransporterProfileRecord> {
    const existingProfile =
      await this.transporterProfileRepository.findByAccountId(accountId);

    if (!existingProfile) {
      throw new NotFoundException(
        'Transporter profile not found for the authenticated account.',
      );
    }

    return this.transporterProfileRepository.updateByAccountId(
      accountId,
      this.normalizeInput(input),
    );
  }

  private normalizeInput(
    input: UpdateTransporterProfileInput,
  ): UpdateTransporterProfileInput {
    return {
      ...(input.displayName !== undefined
        ? { displayName: input.displayName.trim() }
        : {}),
      ...(input.businessName !== undefined
        ? { businessName: this.normalizeNullableText(input.businessName) }
        : {}),
      ...(input.contactPhone !== undefined
        ? { contactPhone: this.normalizeNullableText(input.contactPhone) }
        : {}),
      ...(input.bio !== undefined
        ? { bio: this.normalizeNullableText(input.bio) }
        : {}),
      ...(input.maxDetourKmDefault !== undefined
        ? { maxDetourKmDefault: input.maxDetourKmDefault }
        : {}),
    };
  }

  private isProfileComplete(profile: {
    displayName?: string | null;
    contactPhone?: string | null;
  }): boolean {
    return (
      this.hasText(profile.displayName) && this.hasText(profile.contactPhone)
    );
  }

  private normalizeNullableText(value: string | null): string | null {
    if (value === null) {
      return null;
    }

    const normalizedValue = value.trim();

    return normalizedValue.length === 0 ? null : normalizedValue;
  }

  private hasText(value: string | null | undefined): boolean {
    return Boolean(value?.trim());
  }
}
