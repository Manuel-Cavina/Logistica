import { Injectable } from '@nestjs/common';
import {
  PrismaService,
  type TransporterVerificationStatus,
} from '@logistica/database';
import {
  adminTransporterDetailSelect,
  adminTransporterListSelect,
  type AdminTransporterDetailRecord,
  type AdminTransporterListRecord,
  type ListAdminTransportersFilters,
} from '../types/admin.types';

@Injectable()
export class AdminTransporterRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(
    filters: ListAdminTransportersFilters,
  ): Promise<AdminTransporterListRecord[]> {
    return this.prisma.transporterProfile.findMany({
      where: {
        ...(filters.status ? { verificationStatus: filters.status } : {}),
      },
      select: adminTransporterListSelect,
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findById(id: string): Promise<AdminTransporterDetailRecord | null> {
    return this.prisma.transporterProfile.findUnique({
      where: { id },
      select: adminTransporterDetailSelect,
    });
  }

  async updateVerificationStatus(
    id: string,
    verificationStatus: TransporterVerificationStatus,
  ): Promise<AdminTransporterDetailRecord> {
    return this.prisma.transporterProfile.update({
      where: { id },
      data: { verificationStatus },
      select: adminTransporterDetailSelect,
    });
  }
}
