import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { TrailerResponseDto } from '../dto/trailer.response.dto';
import { TrailerRepository } from '../repositories/trailer.repository';
import type {
  CreateTrailerInput,
  TrailerRecord,
  UpdateTrailerInput,
} from '../types/trailer.types';

@Injectable()
export class TrailerService {
  constructor(private readonly trailerRepository: TrailerRepository) {}

  async listOwnTrailers(accountId: string): Promise<TrailerResponseDto[]> {
    const trailers =
      await this.trailerRepository.findOwnedByAccountId(accountId);

    return trailers.map((trailer) => this.toTrailerResponse(trailer));
  }

  /**
   * Reusable E4-facing criterion: tells whether the transporter owns at least
   * one active trailer without materializing the trailer list.
   */
  async hasActiveTrailer(accountId: string): Promise<boolean> {
    return this.trailerRepository.hasActiveTrailer(accountId);
  }

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

  async updateOwnTrailer(
    accountId: string,
    trailerId: string,
    input: UpdateTrailerInput,
  ): Promise<TrailerResponseDto> {
    const existingTrailer = await this.trailerRepository.findOwnedById(
      accountId,
      trailerId,
    );

    if (!existingTrailer) {
      throw new NotFoundException(
        'Trailer not found for the authenticated account.',
      );
    }

    this.validateOperationalCapacity(input);

    const updatedTrailer = await this.trailerRepository.updateById(
      trailerId,
      input,
    );

    return this.toTrailerResponse(updatedTrailer);
  }

  async deactivateOwnTrailer(
    accountId: string,
    trailerId: string,
  ): Promise<TrailerResponseDto> {
    const existingTrailer = await this.trailerRepository.findOwnedById(
      accountId,
      trailerId,
    );

    if (!existingTrailer) {
      throw new NotFoundException(
        'Trailer not found for the authenticated account.',
      );
    }

    if (!existingTrailer.isActive) {
      return this.toTrailerResponse(existingTrailer);
    }

    const deactivatedTrailer = await this.trailerRepository.updateById(
      trailerId,
      {
        isActive: false,
      },
    );

    return this.toTrailerResponse(deactivatedTrailer);
  }

  private validateOperationalCapacity(
    input: Pick<CreateTrailerInput, 'totalCapacity'> | UpdateTrailerInput,
  ): void {
    if (input.totalCapacity === undefined) {
      return;
    }

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
