import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingStatus,
  PrismaService,
  TripOfferStatus,
} from '@logistica/database';
import type { BookingResponseDto } from '../dto/booking.response.dto';
import { BookingRepository } from '../repositories/booking.repository';
import type { BookingRecord, CreateBookingInput } from '../types/booking.types';
import { BOOKING_INSUFFICIENT_CAPACITY_MESSAGE } from './booking.errors';

const BOOKING_PENDING_PAYMENT_TTL_MS = 30 * 60 * 1000;

@Injectable()
export class BookingService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createBooking(
    clientAccountId: string,
    input: CreateBookingInput,
  ): Promise<BookingResponseDto> {
    const booking = await this.prisma.$transaction(async (tx) => {
      const tripOffer = await this.bookingRepository.lockTripOfferById(
        input.tripOfferId,
        tx,
      );

      if (!tripOffer) {
        throw new NotFoundException('Trip offer not found.');
      }

      if (tripOffer.status !== TripOfferStatus.PUBLISHED) {
        throw new ConflictException(
          'Bookings can only be created for trip offers in PUBLISHED status.',
        );
      }

      this.ensureAvailableCapacity(
        tripOffer.availableCapacity,
        input.requestedUnits,
      );

      const remainingCapacity =
        tripOffer.availableCapacity - input.requestedUnits;
      const unitPriceSnapshot = tripOffer.pricePerSlot;
      const totalPriceSnapshot = unitPriceSnapshot * input.requestedUnits;
      const expiresAt = new Date(Date.now() + BOOKING_PENDING_PAYMENT_TTL_MS);

      await this.bookingRepository.updateTripOfferCapacity(
        tripOffer.id,
        input.requestedUnits,
        remainingCapacity === 0
          ? TripOfferStatus.FULL
          : TripOfferStatus.PUBLISHED,
        tx,
      );

      return this.bookingRepository.create(
        {
          tripOfferId: tripOffer.id,
          clientAccountId,
          requestedUnits: input.requestedUnits,
          unitPriceSnapshot,
          totalPriceSnapshot,
          expiresAt,
        },
        tx,
      );
    });

    return this.toBookingResponse(booking);
  }

  private ensureAvailableCapacity(
    availableCapacity: number,
    requestedUnits: number,
  ): void {
    if (requestedUnits > availableCapacity) {
      throw new ConflictException(BOOKING_INSUFFICIENT_CAPACITY_MESSAGE);
    }
  }

  private toBookingResponse(booking: BookingRecord): BookingResponseDto {
    return {
      id: booking.id,
      tripOfferId: booking.tripOfferId,
      clientAccountId: booking.clientAccountId,
      requestedUnits: booking.requestedUnits,
      unitPriceSnapshot: booking.unitPriceSnapshot,
      totalPriceSnapshot: booking.totalPriceSnapshot,
      expiresAt: booking.expiresAt,
      status: booking.status ?? BookingStatus.PENDING_PAYMENT,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}
