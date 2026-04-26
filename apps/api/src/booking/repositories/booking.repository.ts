import { Injectable } from '@nestjs/common';
import {
  BookingStatus,
  Prisma,
  PrismaService,
  TripOfferStatus,
  type Prisma as PrismaNamespace,
} from '@logistica/database';
import {
  bookingDetailSelect,
  bookingSelect,
  type BookingDetailRecord,
  type BookingRecord,
  tripOfferBookingSelect,
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

  async findOwnedDetailById(
    clientAccountId: string,
    bookingId: string,
  ): Promise<BookingDetailRecord | null> {
    return this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        clientAccountId,
      },
      select: bookingDetailSelect,
    });
  }

  async lockTripOfferById(
    tripOfferId: string,
    tx: PrismaNamespace.TransactionClient,
  ): Promise<TripOfferBookingRecord | null> {
    const [tripOffer] = await tx.$queryRaw<TripOfferBookingRecord[]>(Prisma.sql`
      SELECT
        id,
        "capacityTotal",
        "availableCapacity",
        "pricePerSlot",
        status
      FROM "trip_offers"
      WHERE id = ${tripOfferId}
      FOR UPDATE
    `);

    return tripOffer ?? null;
  }

  async expirePendingBookingsForTripOffer(
    tripOfferId: string,
    now: Date,
    tx: PrismaNamespace.TransactionClient,
  ): Promise<number> {
    const expiredBookings = await tx.$queryRaw<
      Array<{ requestedUnits: number }>
    >(
      Prisma.sql`
        UPDATE "bookings"
        SET
          "status" = ${BookingStatus.EXPIRED}::"BookingStatus",
          "updatedAt" = ${now}
        WHERE
          "tripOfferId" = ${tripOfferId}
          AND "status" = ${BookingStatus.PENDING_PAYMENT}::"BookingStatus"
          AND "expiresAt" <= ${now}
        RETURNING "requestedUnits"
      `,
    );

    return expiredBookings.reduce(
      (releasedUnits, booking) => releasedUnits + booking.requestedUnits,
      0,
    );
  }

  async updateTripOfferAvailability(
    tripOfferId: string,
    availableCapacity: number,
    status: TripOfferStatus,
    tx: PrismaNamespace.TransactionClient,
  ): Promise<TripOfferBookingRecord> {
    return tx.tripOffer.update({
      where: { id: tripOfferId },
      data: {
        availableCapacity,
        status,
      },
      select: tripOfferBookingSelect,
    });
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
