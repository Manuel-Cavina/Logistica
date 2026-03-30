import { Injectable } from '@nestjs/common';
import type { GetAdminTransportersQueryDto } from '../dto/get-admin-transporters.query.dto';
import { AdminTransporterListItemResponseDto } from '../dto/admin-transporter-list-item.response.dto';
import type { AdminTransporterListRecord } from '../types/admin.types';
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
}
