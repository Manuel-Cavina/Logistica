import { Injectable } from '@nestjs/common';
import { PrismaService } from '@logistica/database';
import type {
  TransporterProfileRecord,
  TransporterProfileUpdateData,
} from '../types/transporter-profile.types';

@Injectable()
export class TransporterProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByAccountId(
    accountId: string,
  ): Promise<TransporterProfileRecord | null> {
    return this.prisma.transporterProfile.findUnique({
      where: { accountId },
    });
  }

  async updateByAccountId(
    accountId: string,
    input: TransporterProfileUpdateData,
  ): Promise<TransporterProfileRecord> {
    return this.prisma.transporterProfile.update({
      where: { accountId },
      data: input,
    });
  }
}
