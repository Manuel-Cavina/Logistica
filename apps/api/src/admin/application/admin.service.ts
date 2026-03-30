import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminTransporterDetailResponseDto } from '../dto/admin-transporter-detail.response.dto';
import type { GetAdminTransportersQueryDto } from '../dto/get-admin-transporters.query.dto';
import { AdminTransporterListItemResponseDto } from '../dto/admin-transporter-list-item.response.dto';
import type { UpdateAdminTransporterVerificationStatusDto } from '../dto/update-admin-transporter-verification-status.dto';
import type {
  AdminTransporterDetailRecord,
  AdminTransporterListRecord,
} from '../types/admin.types';
import { AdminTransporterRepository } from '../repositories/admin-transporter.repository';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminTransporterRepository: AdminTransporterRepository,
  ) {}

  async listTransporters(
    query: GetAdminTransportersQueryDto,
  ): Promise<AdminTransporterListItemResponseDto[]> {
    const transporters = await this.adminTransporterRepository.findMany({
      status: query.status,
    });

    return transporters.map((transporter) =>
      this.toListItemResponse(transporter),
    );
  }

  async getTransporterDetail(
    id: string,
  ): Promise<AdminTransporterDetailResponseDto> {
    const transporter = await this.adminTransporterRepository.findById(id);

    if (!transporter) {
      throw new NotFoundException('Transporter profile not found.');
    }

    return this.toDetailResponse(transporter);
  }

  async updateTransporterVerificationStatus(
    id: string,
    input: UpdateAdminTransporterVerificationStatusDto,
  ): Promise<AdminTransporterDetailResponseDto> {
    const transporter = await this.adminTransporterRepository.findById(id);

    if (!transporter) {
      throw new NotFoundException('Transporter profile not found.');
    }

    if (
      !this.isAllowedVerificationTransition(
        transporter.verificationStatus,
        input.verificationStatus,
      )
    ) {
      throw new ConflictException(
        `Invalid transporter verification transition from ${transporter.verificationStatus} to ${input.verificationStatus}.`,
      );
    }

    const updatedTransporter =
      await this.adminTransporterRepository.updateVerificationStatus(
        id,
        input.verificationStatus,
      );

    return this.toDetailResponse(updatedTransporter);
  }

  private toListItemResponse(
    transporter: AdminTransporterListRecord,
  ): AdminTransporterListItemResponseDto {
    return {
      id: transporter.id,
      displayName: transporter.displayName,
      contactPhone: transporter.contactPhone,
      verificationStatus: transporter.verificationStatus,
    };
  }

  private toDetailResponse(
    transporter: AdminTransporterDetailRecord,
  ): AdminTransporterDetailResponseDto {
    return {
      id: transporter.id,
      displayName: transporter.displayName,
      businessName: transporter.businessName,
      contactPhone: transporter.contactPhone,
      bio: transporter.bio,
      maxDetourKmDefault: transporter.maxDetourKmDefault,
      verificationStatus: transporter.verificationStatus,
    };
  }

  private isAllowedVerificationTransition(
    currentStatus: AdminTransporterDetailRecord['verificationStatus'],
    nextStatus: UpdateAdminTransporterVerificationStatusDto['verificationStatus'],
  ): boolean {
    return (
      currentStatus === 'PENDING' &&
      (nextStatus === 'VERIFIED' || nextStatus === 'REJECTED')
    );
  }
}
