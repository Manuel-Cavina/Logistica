import { Injectable } from '@nestjs/common';
import {
  BookingStatus,
  Prisma,
  PrismaService,
  TripOfferStatus,
  type Prisma as PrismaNamespace,
} from '@logistica/database';
import {
  bookingSelect,
  tripOfferBookingSelect,
  type BookingRecord,
  type TripOfferBookingRecord,
} from '../types/booking.types';

interface CreateBookingRecordInput {
  tripOfferId: string;
  clientAccountId: string;
  requestedUnits: number;
  unitPriceSnapshot: number;
  totalPriceSnapshot: number;
  expiresAt: Date;
}

@Injectable()
export class BookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async lockTripOfferById(
    tripOfferId: string,
    tx: PrismaNamespace.TransactionClient,
  ): Promise<TripOfferBookingRecord | null> {
    const [tripOffer] = await tx.$queryRaw<TripOfferBookingRecord[]>(Prisma.sql`
      SELECT
        id,
        "availableCapacity",
        "pricePerSlot",
        status
      FROM "trip_offers"
      WHERE id = ${tripOfferId}
      FOR UPDATE
    `);

    return tripOffer ?? null;
  }

  async updateTripOfferCapacity(
    tripOfferId: string,
    requestedUnits: number,
    status: TripOfferStatus,
    tx: PrismaNamespace.TransactionClient,
  ): Promise<TripOfferBookingRecord> {
    return tx.tripOffer.update({
      where: { id: tripOfferId },
      data: {
        availableCapacity: {
          decrement: requestedUnits,
        },
        status,
      },
      select: tripOfferBookingSelect,
    });
  }

  async create(
    input: CreateBookingRecordInput,
    tx: PrismaNamespace.TransactionClient,
  ): Promise<BookingRecord> {
    return tx.booking.create({
      data: {
        tripOffer: {
          connect: {
            id: input.tripOfferId,
          },
        },
        clientAccount: {
          connect: {
            id: input.clientAccountId,
          },
        },
        requestedUnits: input.requestedUnits,
        unitPriceSnapshot: input.unitPriceSnapshot,
        totalPriceSnapshot: input.totalPriceSnapshot,
        expiresAt: input.expiresAt,
        status: BookingStatus.PENDING_PAYMENT,
      } satisfies Prisma.BookingCreateInput,
      select: bookingSelect,
    });
  }
}
