import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  TransporterProfileRecord,
  TransporterProfileUpdateData,
  UpdateTransporterProfileInput,
} from '../types/transporter-profile.types';
import { GetOwnTransporterProfileResponseDto } from '../dto/get-own-transporter-profile.response.dto';
import { TransporterProfileRepository } from '../repositories/transporter-profile.repository';

@Injectable()
export class TransporterProfileService {
  constructor(
    private readonly transporterProfileRepository: TransporterProfileRepository,
  ) {}

  async getOwnProfile(
    accountId: string,
  ): Promise<GetOwnTransporterProfileResponseDto> {
    const existingProfile =
      await this.transporterProfileRepository.findByAccountId(accountId);

    if (!existingProfile) {
      throw new NotFoundException(
        'Transporter profile not found for the authenticated account.',
      );
    }

    return this.toOwnProfileResponse(existingProfile);
  }

  async updateOwnProfile(
    accountId: string,
    input: UpdateTransporterProfileInput,
  ): Promise<GetOwnTransporterProfileResponseDto> {
    const existingProfile =
      await this.transporterProfileRepository.findByAccountId(accountId);

    if (!existingProfile) {
      throw new NotFoundException(
        'Transporter profile not found for the authenticated account.',
      );
    }

    const normalizedInput = this.normalizeInput(input);
    const finalInput = this.applyVerificationTransition(
      existingProfile,
      normalizedInput,
    );

    const updatedProfile =
      await this.transporterProfileRepository.updateByAccountId(
        accountId,
        finalInput,
      );

    return this.toOwnProfileResponse(updatedProfile);
  }

  private applyVerificationTransition(
    existingProfile: TransporterProfileRecord,
    normalizedInput: UpdateTransporterProfileInput,
  ): TransporterProfileUpdateData {
    const resultingProfile = {
      displayName: normalizedInput.displayName ?? existingProfile.displayName,
      contactPhone:
        normalizedInput.contactPhone !== undefined
          ? normalizedInput.contactPhone
          : existingProfile.contactPhone,
    };

    if (
      existingProfile.verificationStatus === 'INCOMPLETE' &&
      this.isProfileComplete(resultingProfile)
    ) {
      return {
        ...normalizedInput,
        verificationStatus: 'PENDING',
      };
    }

    return normalizedInput;
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

  private toOwnProfileResponse(
    profile: TransporterProfileRecord,
  ): GetOwnTransporterProfileResponseDto {
    return {
      displayName: profile.displayName,
      businessName: profile.businessName,
      contactPhone: profile.contactPhone,
      bio: profile.bio,
      maxDetourKmDefault: profile.maxDetourKmDefault,
      verificationStatus: profile.verificationStatus,
    };
  }
}
