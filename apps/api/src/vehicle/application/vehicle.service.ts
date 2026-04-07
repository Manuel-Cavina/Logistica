import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@logistica/database';
import type { VehicleResponseDto } from '../dto/vehicle.response.dto';
import { VehicleRepository } from '../repositories/vehicle.repository';
import type { CreateVehicleInput, VehicleRecord } from '../types/vehicle.types';

@Injectable()
export class VehicleService {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async createOwnVehicle(
    accountId: string,
    input: CreateVehicleInput,
  ): Promise<VehicleResponseDto> {
    const transporterProfile =
      await this.vehicleRepository.findTransporterProfileByAccountId(accountId);

    if (!transporterProfile) {
      throw new NotFoundException(
        'Transporter profile not found for the authenticated account.',
      );
    }

    const normalizedInput = this.normalizeInput(input);
    const existingVehicle = await this.vehicleRepository.findByLicensePlate(
      normalizedInput.licensePlate,
    );

    if (existingVehicle) {
      throw new ConflictException(
        'A vehicle with this license plate already exists.',
      );
    }

    try {
      const createdVehicle = await this.vehicleRepository.create(
        transporterProfile.id,
        normalizedInput,
      );

      return this.toVehicleResponse(createdVehicle);
    } catch (error) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new ConflictException(
          'A vehicle with this license plate already exists.',
        );
      }

      throw error;
    }
  }

  private normalizeInput(input: CreateVehicleInput): CreateVehicleInput {
    return {
      licensePlate: input.licensePlate.trim().toUpperCase(),
      brand: input.brand.trim(),
      model: input.model.trim(),
    };
  }

  private toVehicleResponse(vehicle: VehicleRecord): VehicleResponseDto {
    return {
      id: vehicle.id,
      licensePlate: vehicle.licensePlate,
      brand: vehicle.brand,
      model: vehicle.model,
      isActive: vehicle.isActive,
    };
  }

  private isUniqueConstraintViolation(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }
}
