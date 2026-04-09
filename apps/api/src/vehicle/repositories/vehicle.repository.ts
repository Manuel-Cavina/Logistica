import { Injectable } from '@nestjs/common';
import { PrismaService } from '@logistica/database';
import type {
  CreateVehicleInput,
  TransporterProfileOwnerRecord,
  VehicleRecord,
  VehicleUpdateData,
} from '../types/vehicle.types';
import {
  transporterProfileOwnerSelect,
  vehicleSelect,
} from '../types/vehicle.types';

@Injectable()
export class VehicleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findTransporterProfileByAccountId(
    accountId: string,
  ): Promise<TransporterProfileOwnerRecord | null> {
    return this.prisma.transporterProfile.findUnique({
      where: { accountId },
      select: transporterProfileOwnerSelect,
    });
  }

  async findByLicensePlate(
    licensePlate: string,
  ): Promise<VehicleRecord | null> {
    return this.prisma.vehicle.findUnique({
      where: { licensePlate },
      select: vehicleSelect,
    });
  }

  async findOwnedById(
    accountId: string,
    vehicleId: string,
  ): Promise<VehicleRecord | null> {
    return this.prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        transporterProfile: {
          accountId,
        },
      },
      select: vehicleSelect,
    });
  }

  async findOwnedByAccountId(accountId: string): Promise<VehicleRecord[]> {
    return this.prisma.vehicle.findMany({
      where: {
        transporterProfile: {
          accountId,
        },
      },
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
      select: vehicleSelect,
    });
  }

  async create(
    transporterProfileId: string,
    input: CreateVehicleInput,
  ): Promise<VehicleRecord> {
    return this.prisma.vehicle.create({
      data: {
        transporterProfile: {
          connect: {
            id: transporterProfileId,
          },
        },
        licensePlate: input.licensePlate,
        brand: input.brand,
        model: input.model,
      },
      select: vehicleSelect,
    });
  }

  async updateById(
    vehicleId: string,
    data: VehicleUpdateData,
  ): Promise<VehicleRecord> {
    return this.prisma.vehicle.update({
      where: { id: vehicleId },
      data,
      select: vehicleSelect,
    });
  }
}
