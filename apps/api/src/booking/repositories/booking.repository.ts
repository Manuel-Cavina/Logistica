import { Injectable } from '@nestjs/common';
import { BookingStatus, PrismaService, type Prisma } from '@logistica/database';
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

  async findTripOfferById(
    tripOfferId: string,
  ): Promise<TripOfferBookingRecord | null> {
    return this.prisma.tripOffer.findUnique({
      where: { id: tripOfferId },
      select: tripOfferBookingSelect,
    });
  }

  async create(input: CreateBookingRecordInput): Promise<BookingRecord> {
    return this.prisma.booking.create({
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
