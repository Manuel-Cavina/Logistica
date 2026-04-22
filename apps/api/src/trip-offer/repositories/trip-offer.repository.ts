import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService, TripOfferStatus } from '@logistica/database';
import type {
  CreateTripOfferInput,
  SearchTripOffersQuery,
  TransporterProfileOwnerRecord,
  TripOfferRecord,
  TripOfferSearchWhereInput,
  TripOfferUpdateData,
} from '../types/trip-offer.types';
import {
  transporterProfileOwnerSelect,
  tripOfferSelect,
} from '../types/trip-offer.types';

@Injectable()
export class TripOfferRepository {
  constructor(private readonly prisma: PrismaService) {}

  async searchPublic(
    query: SearchTripOffersQuery,
  ): Promise<{ items: TripOfferRecord[]; total: number }> {
    const where = this.buildSearchWhere(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.tripOffer.findMany({
        where,
        orderBy: [{ departureDate: 'asc' }, { createdAt: 'desc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: tripOfferSelect,
      }),
      this.prisma.tripOffer.count({ where }),
    ]);

    return { items, total };
  }

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

  private buildSearchWhere(
    query: SearchTripOffersQuery,
  ): TripOfferSearchWhereInput {
    const dayStart = new Date(
      Date.UTC(
        query.date.getUTCFullYear(),
        query.date.getUTCMonth(),
        query.date.getUTCDate(),
      ),
    );
    const nextDayStart = new Date(dayStart);
    nextDayStart.setUTCDate(nextDayStart.getUTCDate() + 1);

    return {
      status: {
        in: [TripOfferStatus.PUBLISHED, TripOfferStatus.FULL],
      },
      originLabel: {
        contains: query.origin,
        mode: 'insensitive',
      },
      destinationLabel: {
        contains: query.destination,
        mode: 'insensitive',
      },
      availableCapacity: {
        gte: query.requiredCapacity,
      },
      departureDate: {
        gte: dayStart,
        lt: nextDayStart,
      },
    };
  }
}
