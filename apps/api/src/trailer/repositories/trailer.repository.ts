import { Injectable } from '@nestjs/common';
import { PrismaService } from '@logistica/database';
import type {
  CreateTrailerInput,
  TrailerRecord,
  TrailerUpdateData,
  TransporterProfileOwnerRecord,
} from '../types/trailer.types';
import {
  trailerSelect,
  transporterProfileOwnerSelect,
} from '../types/trailer.types';

@Injectable()
export class TrailerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findTransporterProfileByAccountId(
    accountId: string,
  ): Promise<TransporterProfileOwnerRecord | null> {
    return this.prisma.transporterProfile.findUnique({
      where: { accountId },
      select: transporterProfileOwnerSelect,
    });
  }

  async create(
    transporterProfileId: string,
    input: CreateTrailerInput,
  ): Promise<TrailerRecord> {
    return this.prisma.trailer.create({
      data: {
        transporterProfile: {
          connect: {
            id: transporterProfileId,
          },
        },
        totalCapacity: input.totalCapacity,
        cargoType: input.cargoType,
        capacityUnit: input.capacityUnit,
      },
      select: trailerSelect,
    });
  }

  async findOwnedById(
    accountId: string,
    trailerId: string,
  ): Promise<TrailerRecord | null> {
    return this.prisma.trailer.findFirst({
      where: {
        id: trailerId,
        transporterProfile: {
          accountId,
        },
      },
      select: trailerSelect,
    });
  }

  async findOwnedByAccountId(accountId: string): Promise<TrailerRecord[]> {
    return this.prisma.trailer.findMany({
      where: {
        transporterProfile: {
          accountId,
        },
      },
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
      select: trailerSelect,
    });
  }

  async hasActiveTrailer(accountId: string): Promise<boolean> {
    const activeTrailer = await this.prisma.trailer.findFirst({
      where: {
        isActive: true,
        transporterProfile: {
          accountId,
        },
      },
      select: {
        id: true,
      },
    });

    return activeTrailer !== null;
  }

  async updateById(
    trailerId: string,
    data: TrailerUpdateData,
  ): Promise<TrailerRecord> {
    return this.prisma.trailer.update({
      where: { id: trailerId },
      data,
      select: trailerSelect,
    });
  }
}
