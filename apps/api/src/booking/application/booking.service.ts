import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, TripOfferStatus } from '@logistica/database';
import type { BookingResponseDto } from '../dto/booking.response.dto';
import { BookingRepository } from '../repositories/booking.repository';
import type { BookingRecord, CreateBookingInput } from '../types/booking.types';

const BOOKING_PENDING_PAYMENT_TTL_MS = 30 * 60 * 1000;

@Injectable()
export class BookingService {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async createBooking(
    clientAccountId: string,
    input: CreateBookingInput,
  ): Promise<BookingResponseDto> {
    const tripOffer = await this.bookingRepository.findTripOfferById(
      input.tripOfferId,
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

    const unitPriceSnapshot = tripOffer.pricePerSlot;
    const totalPriceSnapshot = unitPriceSnapshot * input.requestedUnits;
    const expiresAt = new Date(Date.now() + BOOKING_PENDING_PAYMENT_TTL_MS);

    const booking = await this.bookingRepository.create({
      tripOfferId: tripOffer.id,
      clientAccountId,
      requestedUnits: input.requestedUnits,
      unitPriceSnapshot,
      totalPriceSnapshot,
      expiresAt,
    });

    return this.toBookingResponse(booking);
  }

  private ensureAvailableCapacity(
    availableCapacity: number,
    requestedUnits: number,
  ): void {
    if (requestedUnits > availableCapacity) {
      throw new ConflictException(
        'Insufficient available capacity for the requested booking units.',
      );
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
