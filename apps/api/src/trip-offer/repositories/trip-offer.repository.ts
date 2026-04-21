import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService, TripOfferStatus } from '@logistica/database';
import type {
  CreateTripOfferInput,
  TransporterProfileOwnerRecord,
  TripOfferRecord,
  TripOfferUpdateData,
} from '../types/trip-offer.types';
import {
  transporterProfileOwnerSelect,
  tripOfferSelect,
} from '../types/trip-offer.types';

@Injectable()
export class TripOfferRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findTransporterProfileByAccountId(
    accountId: string,
  ): Promise<TransporterProfileOwnerRecord | null> {
    return this.prisma.transporterProfile.findUnique({
      where: { accountId },
      select: transporterProfileOwnerSelect,
    });
  }

  async findById(tripOfferId: string): Promise<TripOfferRecord | null> {
    return this.prisma.tripOffer.findUnique({
      where: { id: tripOfferId },
      select: tripOfferSelect,
    });
  }

  async findOwnedByAccountId(accountId: string): Promise<TripOfferRecord[]> {
    return this.prisma.tripOffer.findMany({
      where: {
        transporterProfile: {
          accountId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: tripOfferSelect,
    });
  }

  async create(
    transporterProfileId: string,
    input: CreateTripOfferInput,
  ): Promise<TripOfferRecord> {
    return this.prisma.tripOffer.create({
      data: {
        transporterProfile: {
          connect: {
            id: transporterProfileId,
          },
        },
        originLabel: input.originLabel,
        originLat: new Prisma.Decimal(input.originLat),
        originLng: new Prisma.Decimal(input.originLng),
        destinationLabel: input.destinationLabel,
        destinationLat: new Prisma.Decimal(input.destinationLat),
        destinationLng: new Prisma.Decimal(input.destinationLng),
        departureDate: input.departureDate ?? null,
        departureWindowStart: input.departureWindowStart ?? null,
        departureWindowEnd: input.departureWindowEnd ?? null,
        capacityTotal: input.capacityTotal,
        availableCapacity: input.capacityTotal,
        pricePerSlot: input.pricePerSlot,
        maxDetourKm: input.maxDetourKm ?? null,
        notes: input.notes ?? null,
        cancellationPolicy: input.cancellationPolicy ?? null,
        cargoType: input.cargoType,
        isReturn: input.isReturn,
        status: TripOfferStatus.DRAFT,
      },
      select: tripOfferSelect,
    });
  }

  async updateById(
    tripOfferId: string,
    data: TripOfferUpdateData,
  ): Promise<TripOfferRecord> {
    return this.prisma.tripOffer.update({
      where: { id: tripOfferId },
      data,
      select: tripOfferSelect,
    });
  }

  async updateStatusById(
    tripOfferId: string,
    status: TripOfferStatus,
  ): Promise<TripOfferRecord> {
    return this.prisma.tripOffer.update({
      where: { id: tripOfferId },
      data: { status },
      select: tripOfferSelect,
    });
  }
}
