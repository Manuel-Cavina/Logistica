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
