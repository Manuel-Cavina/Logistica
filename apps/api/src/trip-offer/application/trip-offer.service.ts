import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TripOfferStatus } from '@logistica/database';
import type { SearchTripOffersResponseDto } from '../dto/search-trip-offers.response.dto';
import type { TripOfferResponseDto } from '../dto/trip-offer.response.dto';
import { TripOfferRepository } from '../repositories/trip-offer.repository';
import type {
  CreateTripOfferInput,
  SearchTripOffersQuery,
  TripOfferRecord,
  UpdateTripOfferInput,
} from '../types/trip-offer.types';

type NullableTemporalInput = {
  departureDate?: Date | null;
  departureWindowStart?: Date | null;
  departureWindowEnd?: Date | null;
};

type TripOfferDraftState = Pick<
  TripOfferRecord,
  | 'originLabel'
  | 'destinationLabel'
  | 'departureDate'
  | 'departureWindowStart'
  | 'departureWindowEnd'
  | 'capacityTotal'
  | 'pricePerSlot'
  | 'maxDetourKm'
  | 'notes'
  | 'cancellationPolicy'
  | 'cargoType'
  | 'isReturn'
> & {
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
};

@Injectable()
export class TripOfferService {
  constructor(private readonly tripOfferRepository: TripOfferRepository) {}

  async searchPublicTripOffers(
    query: SearchTripOffersQuery,
  ): Promise<SearchTripOffersResponseDto> {
    const normalizedQuery = {
      ...query,
      origin: query.origin.trim(),
      destination: query.destination.trim(),
    };
    const { items, total } =
      await this.tripOfferRepository.searchPublic(normalizedQuery);

    return {
      items: items.map((tripOffer) => this.toPublicSearchItem(tripOffer)),
      page: normalizedQuery.page,
      limit: normalizedQuery.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / normalizedQuery.limit),
    };
  }

  async listOwnTripOffers(accountId: string): Promise<TripOfferResponseDto[]> {
    await this.getTransporterProfileOrThrow(accountId);

    const tripOffers =
      await this.tripOfferRepository.findOwnedByAccountId(accountId);

    return tripOffers.map((tripOffer) => this.toTripOfferResponse(tripOffer));
  }

  async createOwnTripOffer(
    accountId: string,
    input: CreateTripOfferInput,
  ): Promise<TripOfferResponseDto> {
    const transporterProfile =
      await this.getTransporterProfileOrThrow(accountId);

    const normalizedInput = this.normalizeCreateInput(input);
    this.validateDraftState(normalizedInput);

    const createdTripOffer = await this.tripOfferRepository.create(
      transporterProfile.id,
      normalizedInput,
    );

    return this.toTripOfferResponse(createdTripOffer);
  }

  async publishOwnTripOffer(
    accountId: string,
    tripOfferId: string,
  ): Promise<TripOfferResponseDto> {
    const existingTripOffer =
      await this.tripOfferRepository.findById(tripOfferId);

    if (!existingTripOffer) {
      throw new NotFoundException('Trip offer not found.');
    }

    const transporterProfile =
      await this.getTransporterProfileOrThrow(accountId);

    this.assertOwnership(existingTripOffer, transporterProfile.id, 'publish');

    if (existingTripOffer.status !== TripOfferStatus.DRAFT) {
      throw new ConflictException(
        'Only trip offers in DRAFT status can be published.',
      );
    }

    this.validateDraftState(this.toDraftState(existingTripOffer));

    const publishedTripOffer = await this.tripOfferRepository.updateStatusById(
      tripOfferId,
      this.resolvePublishedStatus(existingTripOffer.availableCapacity),
    );

    return this.toTripOfferResponse(publishedTripOffer);
  }

  async updateOwnTripOffer(
    accountId: string,
    tripOfferId: string,
    input: UpdateTripOfferInput,
  ): Promise<TripOfferResponseDto> {
    const existingTripOffer =
      await this.tripOfferRepository.findById(tripOfferId);

    if (!existingTripOffer) {
      throw new NotFoundException('Trip offer not found.');
    }

    const transporterProfile =
      await this.getTransporterProfileOrThrow(accountId);

    this.assertOwnership(existingTripOffer, transporterProfile.id, 'edit');

    if (existingTripOffer.status !== 'DRAFT') {
      throw new ConflictException(
        'Only trip offers in DRAFT status can be edited.',
      );
    }

    const normalizedInput = this.normalizeUpdateInput(input);
    const finalDraftState = this.mergeDraftState(
      existingTripOffer,
      normalizedInput,
    );

    this.validateDraftState(finalDraftState);

    const updatedTripOffer = await this.tripOfferRepository.updateById(
      tripOfferId,
      {
        ...this.toUpdateData(normalizedInput),
        availableCapacity: finalDraftState.capacityTotal,
      },
    );

    return this.toTripOfferResponse(updatedTripOffer);
  }

  async closeOwnTripOffer(
    accountId: string,
    tripOfferId: string,
  ): Promise<TripOfferResponseDto> {
    const existingTripOffer =
      await this.tripOfferRepository.findById(tripOfferId);

    if (!existingTripOffer) {
      throw new NotFoundException('Trip offer not found.');
    }

    const transporterProfile =
      await this.getTransporterProfileOrThrow(accountId);

    this.assertOwnership(existingTripOffer, transporterProfile.id, 'close');
    this.assertStatusTransitionAllowed(
      existingTripOffer,
      [TripOfferStatus.DRAFT, TripOfferStatus.PUBLISHED, TripOfferStatus.FULL],
      'close',
    );

    const closedTripOffer = await this.tripOfferRepository.updateStatusById(
      tripOfferId,
      TripOfferStatus.CLOSED,
    );

    return this.toTripOfferResponse(closedTripOffer);
  }

  async cancelOwnTripOffer(
    accountId: string,
    tripOfferId: string,
  ): Promise<TripOfferResponseDto> {
    const existingTripOffer =
      await this.tripOfferRepository.findById(tripOfferId);

    if (!existingTripOffer) {
      throw new NotFoundException('Trip offer not found.');
    }

    const transporterProfile =
      await this.getTransporterProfileOrThrow(accountId);

    this.assertOwnership(existingTripOffer, transporterProfile.id, 'cancel');
    this.assertStatusTransitionAllowed(
      existingTripOffer,
      [TripOfferStatus.DRAFT, TripOfferStatus.PUBLISHED, TripOfferStatus.FULL],
      'cancel',
    );

    const cancelledTripOffer = await this.tripOfferRepository.updateStatusById(
      tripOfferId,
      TripOfferStatus.CANCELLED,
    );

    return this.toTripOfferResponse(cancelledTripOffer);
  }

  private validateDraftState(input: {
    departureDate?: Date | null;
    departureWindowStart?: Date | null;
    departureWindowEnd?: Date | null;
    capacityTotal: number;
    pricePerSlot: number;
    maxDetourKm?: number | null;
  }): void {
    this.validateTemporalState(input);

    if (!Number.isInteger(input.capacityTotal) || input.capacityTotal <= 0) {
      throw new BadRequestException(
        'Trip offer total capacity must be a positive integer.',
      );
    }

    if (!Number.isInteger(input.pricePerSlot) || input.pricePerSlot < 0) {
      throw new BadRequestException(
        'Trip offer slot price must be a non-negative integer.',
      );
    }

    if (
      input.maxDetourKm !== null &&
      input.maxDetourKm !== undefined &&
      (!Number.isInteger(input.maxDetourKm) || input.maxDetourKm < 0)
    ) {
      throw new BadRequestException(
        'Trip offer max detour must be a non-negative integer.',
      );
    }
  }

  private validateTemporalState(input: NullableTemporalInput): void {
    const hasDepartureDate = input.departureDate instanceof Date;
    const hasWindowStart = input.departureWindowStart instanceof Date;
    const hasWindowEnd = input.departureWindowEnd instanceof Date;
    const hasWindow = hasWindowStart || hasWindowEnd;

    if (hasDepartureDate === hasWindow) {
      throw new BadRequestException(
        'Trip offer must define either a departure date or a complete departure window.',
      );
    }

    if (hasWindowStart !== hasWindowEnd) {
      throw new BadRequestException(
        'Trip offer departure window requires both start and end values.',
      );
    }

    if (
      hasWindowStart &&
      hasWindowEnd &&
      input.departureWindowStart!.getTime() >=
        input.departureWindowEnd!.getTime()
    ) {
      throw new BadRequestException(
        'Trip offer departure window start must be before the end.',
      );
    }
  }

  private normalizeCreateInput(
    input: CreateTripOfferInput,
  ): CreateTripOfferInput {
    return {
      originLabel: input.originLabel.trim(),
      originLat: input.originLat,
      originLng: input.originLng,
      destinationLabel: input.destinationLabel.trim(),
      destinationLat: input.destinationLat,
      destinationLng: input.destinationLng,
      departureDate: input.departureDate ?? null,
      departureWindowStart: input.departureWindowStart ?? null,
      departureWindowEnd: input.departureWindowEnd ?? null,
      capacityTotal: input.capacityTotal,
      availableCapacity: input.capacityTotal,
      pricePerSlot: input.pricePerSlot,
      maxDetourKm: input.maxDetourKm ?? null,
      notes: this.normalizeNullableText(input.notes),
      cancellationPolicy: this.normalizeNullableText(input.cancellationPolicy),
      cargoType: input.cargoType,
      isReturn: input.isReturn,
    };
  }

  private normalizeUpdateInput(
    input: UpdateTripOfferInput,
  ): UpdateTripOfferInput {
    return {
      ...(input.originLabel !== undefined
        ? { originLabel: input.originLabel.trim() }
        : {}),
      ...(input.originLat !== undefined ? { originLat: input.originLat } : {}),
      ...(input.originLng !== undefined ? { originLng: input.originLng } : {}),
      ...(input.destinationLabel !== undefined
        ? { destinationLabel: input.destinationLabel.trim() }
        : {}),
      ...(input.destinationLat !== undefined
        ? { destinationLat: input.destinationLat }
        : {}),
      ...(input.destinationLng !== undefined
        ? { destinationLng: input.destinationLng }
        : {}),
      ...(input.departureDate !== undefined
        ? { departureDate: input.departureDate }
        : {}),
      ...(input.departureWindowStart !== undefined
        ? { departureWindowStart: input.departureWindowStart }
        : {}),
      ...(input.departureWindowEnd !== undefined
        ? { departureWindowEnd: input.departureWindowEnd }
        : {}),
      ...(input.capacityTotal !== undefined
        ? { capacityTotal: input.capacityTotal }
        : {}),
      ...(input.availableCapacity !== undefined
        ? { availableCapacity: input.availableCapacity }
        : {}),
      ...(input.pricePerSlot !== undefined
        ? { pricePerSlot: input.pricePerSlot }
        : {}),
      ...(input.maxDetourKm !== undefined
        ? { maxDetourKm: input.maxDetourKm }
        : {}),
      ...(input.notes !== undefined
        ? { notes: this.normalizeNullableText(input.notes) }
        : {}),
      ...(input.cancellationPolicy !== undefined
        ? {
            cancellationPolicy: this.normalizeNullableText(
              input.cancellationPolicy,
            ),
          }
        : {}),
      ...(input.cargoType !== undefined ? { cargoType: input.cargoType } : {}),
      ...(input.isReturn !== undefined ? { isReturn: input.isReturn } : {}),
    };
  }

  private mergeDraftState(
    existingTripOffer: TripOfferRecord,
    input: UpdateTripOfferInput,
  ): TripOfferDraftState {
    return {
      originLabel: input.originLabel ?? existingTripOffer.originLabel,
      originLat: input.originLat ?? Number(existingTripOffer.originLat),
      originLng: input.originLng ?? Number(existingTripOffer.originLng),
      destinationLabel:
        input.destinationLabel ?? existingTripOffer.destinationLabel,
      destinationLat:
        input.destinationLat ?? Number(existingTripOffer.destinationLat),
      destinationLng:
        input.destinationLng ?? Number(existingTripOffer.destinationLng),
      departureDate:
        input.departureDate !== undefined
          ? input.departureDate
          : existingTripOffer.departureDate,
      departureWindowStart:
        input.departureWindowStart !== undefined
          ? input.departureWindowStart
          : existingTripOffer.departureWindowStart,
      departureWindowEnd:
        input.departureWindowEnd !== undefined
          ? input.departureWindowEnd
          : existingTripOffer.departureWindowEnd,
      capacityTotal: input.capacityTotal ?? existingTripOffer.capacityTotal,
      pricePerSlot: input.pricePerSlot ?? existingTripOffer.pricePerSlot,
      maxDetourKm:
        input.maxDetourKm !== undefined
          ? input.maxDetourKm
          : existingTripOffer.maxDetourKm,
      notes: input.notes !== undefined ? input.notes : existingTripOffer.notes,
      cancellationPolicy:
        input.cancellationPolicy !== undefined
          ? input.cancellationPolicy
          : existingTripOffer.cancellationPolicy,
      cargoType: input.cargoType ?? existingTripOffer.cargoType,
      isReturn: input.isReturn ?? existingTripOffer.isReturn,
    };
  }

  private toUpdateData(input: UpdateTripOfferInput) {
    return {
      ...(input.originLabel !== undefined
        ? { originLabel: input.originLabel }
        : {}),
      ...(input.originLat !== undefined ? { originLat: input.originLat } : {}),
      ...(input.originLng !== undefined ? { originLng: input.originLng } : {}),
      ...(input.destinationLabel !== undefined
        ? { destinationLabel: input.destinationLabel }
        : {}),
      ...(input.destinationLat !== undefined
        ? { destinationLat: input.destinationLat }
        : {}),
      ...(input.destinationLng !== undefined
        ? { destinationLng: input.destinationLng }
        : {}),
      ...(input.departureDate !== undefined
        ? { departureDate: input.departureDate }
        : {}),
      ...(input.departureWindowStart !== undefined
        ? { departureWindowStart: input.departureWindowStart }
        : {}),
      ...(input.departureWindowEnd !== undefined
        ? { departureWindowEnd: input.departureWindowEnd }
        : {}),
      ...(input.capacityTotal !== undefined
        ? { capacityTotal: input.capacityTotal }
        : {}),
      ...(input.pricePerSlot !== undefined
        ? { pricePerSlot: input.pricePerSlot }
        : {}),
      ...(input.maxDetourKm !== undefined
        ? { maxDetourKm: input.maxDetourKm }
        : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.cancellationPolicy !== undefined
        ? { cancellationPolicy: input.cancellationPolicy }
        : {}),
      ...(input.cargoType !== undefined ? { cargoType: input.cargoType } : {}),
      ...(input.isReturn !== undefined ? { isReturn: input.isReturn } : {}),
    };
  }

  private normalizeNullableText(
    value: string | null | undefined,
  ): string | null {
    if (value === undefined || value === null) {
      return value ?? null;
    }

    const normalizedValue = value.trim();

    return normalizedValue.length > 0 ? normalizedValue : null;
  }

  private async getTransporterProfileOrThrow(accountId: string) {
    const transporterProfile =
      await this.tripOfferRepository.findTransporterProfileByAccountId(
        accountId,
      );

    if (!transporterProfile) {
      throw new NotFoundException(
        'Transporter profile not found for the authenticated account.',
      );
    }

    return transporterProfile;
  }

  private assertOwnership(
    tripOffer: TripOfferRecord,
    transporterProfileId: string,
    action: 'edit' | 'publish' | 'close' | 'cancel',
  ): void {
    if (tripOffer.transporterProfileId === transporterProfileId) {
      return;
    }

    const messages = {
      edit: 'You cannot edit a trip offer that belongs to another transporter.',
      publish:
        'You cannot publish a trip offer that belongs to another transporter.',
      close:
        'You cannot close a trip offer that belongs to another transporter.',
      cancel:
        'You cannot cancel a trip offer that belongs to another transporter.',
    } as const;

    throw new ForbiddenException(messages[action]);
  }

  private assertStatusTransitionAllowed(
    tripOffer: TripOfferRecord,
    allowedStatuses: TripOfferStatus[],
    action: 'close' | 'cancel',
  ): void {
    const effectiveStatus = this.getEffectiveStatus(tripOffer);

    if (allowedStatuses.includes(effectiveStatus)) {
      return;
    }

    const messages = {
      close:
        'Only trip offers in DRAFT, PUBLISHED, or FULL status can be closed.',
      cancel:
        'Only trip offers in DRAFT, PUBLISHED, or FULL status can be cancelled.',
    } as const;

    throw new ConflictException(messages[action]);
  }

  private toDraftState(tripOffer: TripOfferRecord): TripOfferDraftState {
    return {
      originLabel: tripOffer.originLabel,
      originLat: Number(tripOffer.originLat),
      originLng: Number(tripOffer.originLng),
      destinationLabel: tripOffer.destinationLabel,
      destinationLat: Number(tripOffer.destinationLat),
      destinationLng: Number(tripOffer.destinationLng),
      departureDate: tripOffer.departureDate,
      departureWindowStart: tripOffer.departureWindowStart,
      departureWindowEnd: tripOffer.departureWindowEnd,
      capacityTotal: tripOffer.capacityTotal,
      pricePerSlot: tripOffer.pricePerSlot,
      maxDetourKm: tripOffer.maxDetourKm,
      notes: tripOffer.notes,
      cancellationPolicy: tripOffer.cancellationPolicy,
      cargoType: tripOffer.cargoType,
      isReturn: tripOffer.isReturn,
    };
  }

  private resolvePublishedStatus(availableCapacity: number): TripOfferStatus {
    return availableCapacity === 0
      ? TripOfferStatus.FULL
      : TripOfferStatus.PUBLISHED;
  }

  private getEffectiveStatus(tripOffer: TripOfferRecord): TripOfferStatus {
    if (
      tripOffer.status === TripOfferStatus.PUBLISHED &&
      tripOffer.availableCapacity === 0
    ) {
      return TripOfferStatus.FULL;
    }

    return tripOffer.status;
  }

  private toTripOfferResponse(
    tripOffer: TripOfferRecord,
  ): TripOfferResponseDto {
    return {
      id: tripOffer.id,
      originLabel: tripOffer.originLabel,
      originLat: Number(tripOffer.originLat),
      originLng: Number(tripOffer.originLng),
      destinationLabel: tripOffer.destinationLabel,
      destinationLat: Number(tripOffer.destinationLat),
      destinationLng: Number(tripOffer.destinationLng),
      departureDate: tripOffer.departureDate,
      departureWindowStart: tripOffer.departureWindowStart,
      departureWindowEnd: tripOffer.departureWindowEnd,
      capacityTotal: tripOffer.capacityTotal,
      availableCapacity: tripOffer.availableCapacity,
      pricePerSlot: tripOffer.pricePerSlot,
      maxDetourKm: tripOffer.maxDetourKm,
      notes: tripOffer.notes,
      cancellationPolicy: tripOffer.cancellationPolicy,
      cargoType: tripOffer.cargoType,
      isReturn: tripOffer.isReturn,
      status: this.getEffectiveStatus(tripOffer),
      createdAt: tripOffer.createdAt,
      updatedAt: tripOffer.updatedAt,
    };
  }

  private toPublicSearchItem(tripOffer: TripOfferRecord) {
    return {
      id: tripOffer.id,
      originLabel: tripOffer.originLabel,
      destinationLabel: tripOffer.destinationLabel,
      departureDate: tripOffer.departureDate,
      availableCapacity: tripOffer.availableCapacity,
      pricePerSlot: tripOffer.pricePerSlot,
      cargoType: tripOffer.cargoType,
      status: this.getEffectiveStatus(tripOffer),
    };
  }
}
