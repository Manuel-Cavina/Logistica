import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { TrailerResponseDto } from '../dto/trailer.response.dto';
import { TrailerRepository } from '../repositories/trailer.repository';
import type { CreateTrailerInput, TrailerRecord } from '../types/trailer.types';

@Injectable()
export class TrailerService {
  constructor(private readonly trailerRepository: TrailerRepository) {}

  async createOwnTrailer(
    accountId: string,
    input: CreateTrailerInput,
  ): Promise<TrailerResponseDto> {
    const transporterProfile =
      await this.trailerRepository.findTransporterProfileByAccountId(accountId);

    if (!transporterProfile) {
      throw new NotFoundException(
        'Transporter profile not found for the authenticated account.',
      );
    }

    this.validateOperationalCapacity(input);

    const createdTrailer = await this.trailerRepository.create(
      transporterProfile.id,
      input,
    );

    return this.toTrailerResponse(createdTrailer);
  }

  private validateOperationalCapacity(input: CreateTrailerInput): void {
    if (!Number.isInteger(input.totalCapacity) || input.totalCapacity <= 0) {
      throw new BadRequestException(
        'Trailer total capacity must be a positive integer.',
      );
    }
  }

  private toTrailerResponse(trailer: TrailerRecord): TrailerResponseDto {
    return {
      id: trailer.id,
      totalCapacity: trailer.totalCapacity,
      cargoType: trailer.cargoType,
      capacityUnit: trailer.capacityUnit,
      isActive: trailer.isActive,
    };
  }
}
