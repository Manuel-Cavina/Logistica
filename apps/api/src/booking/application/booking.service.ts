import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BookingStatus,
  PrismaService,
  TripOfferStatus,
} from '@logistica/database';
import type { BookingDetailResponseDto } from '../dto/booking-detail.response.dto';
import type { BookingResponseDto } from '../dto/booking.response.dto';
import { BookingRepository } from '../repositories/booking.repository';
import type {
  BookingDetailRecord,
  BookingRecord,
  CreateBookingInput,
  TripOfferBookingRecord,
} from '../types/booking.types';
import { BOOKING_INSUFFICIENT_CAPACITY_MESSAGE } from './booking.errors';

@Injectable()
export class BookingService {
  private readonly pendingPaymentTtlMilliseconds: number;

  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly prisma: PrismaService,
    configService: ConfigService,
  ) {
    this.pendingPaymentTtlMilliseconds =
      this.getPendingPaymentTtlMilliseconds(configService);
  }

  async createBooking(
    clientAccountId: string,
    input: CreateBookingInput,
  ): Promise<BookingResponseDto> {
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + this.pendingPaymentTtlMilliseconds,
    );

    const booking = await this.prisma.$transaction(async (tx) => {
      const lockedTripOffer = await this.bookingRepository.lockTripOfferById(
        input.tripOfferId,
        tx,
      );

      if (!lockedTripOffer) {
        throw new NotFoundException('Trip offer not found.');
      }

      const releasedUnits =
        await this.bookingRepository.expirePendingBookingsForTripOffer(
          lockedTripOffer.id,
          now,
          tx,
        );
      const effectiveTripOffer = this.applyReleasedCapacity(
        lockedTripOffer,
        releasedUnits,
      );

      if (releasedUnits > 0) {
        await this.bookingRepository.updateTripOfferAvailability(
          effectiveTripOffer.id,
          effectiveTripOffer.availableCapacity,
          effectiveTripOffer.status,
          tx,
        );
      }

      this.ensureTripOfferIsBookable(effectiveTripOffer);
      this.ensureAvailableCapacity(
        effectiveTripOffer.availableCapacity,
        input.requestedUnits,
      );

      const nextAvailableCapacity =
        effectiveTripOffer.availableCapacity - input.requestedUnits;
      const unitPriceSnapshot = effectiveTripOffer.pricePerSlot;
      const totalPriceSnapshot = unitPriceSnapshot * input.requestedUnits;

      await this.bookingRepository.updateTripOfferCapacity(
        effectiveTripOffer.id,
        input.requestedUnits,
        this.resolveStatusForAvailableCapacity(
          effectiveTripOffer.status,
          nextAvailableCapacity,
        ),
        tx,
      );

      return this.bookingRepository.create(
        {
          tripOfferId: effectiveTripOffer.id,
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

  async getOwnBookingById(
    clientAccountId: string,
    bookingId: string,
  ): Promise<BookingDetailResponseDto> {
    const booking = await this.bookingRepository.findOwnedDetailById(
      clientAccountId,
      bookingId,
    );

    if (!booking) {
      throw new NotFoundException(
        'Booking not found for the authenticated account.',
      );
    }

    return this.toBookingDetailResponse(booking);
  }

  private getPendingPaymentTtlMilliseconds(
    configService: ConfigService,
  ): number {
    const rawTtlMinutes =
      configService.get<string>('BOOKING_PENDING_PAYMENT_TTL_MINUTES') ?? '30';
    const ttlMinutes = Number.parseInt(rawTtlMinutes, 10);

    if (!Number.isInteger(ttlMinutes) || ttlMinutes <= 0) {
      throw new Error(
        'BOOKING_PENDING_PAYMENT_TTL_MINUTES must be a positive integer.',
      );
    }

    return ttlMinutes * 60 * 1000;
  }

  private applyReleasedCapacity(
    tripOffer: TripOfferBookingRecord,
    releasedUnits: number,
  ): TripOfferBookingRecord {
    if (releasedUnits === 0) {
      return tripOffer;
    }

    const availableCapacity = Math.min(
      tripOffer.capacityTotal,
      tripOffer.availableCapacity + releasedUnits,
    );

    return {
      ...tripOffer,
      availableCapacity,
      status: this.resolveStatusForAvailableCapacity(
        tripOffer.status,
        availableCapacity,
      ),
    };
  }

  private ensureTripOfferIsBookable(tripOffer: TripOfferBookingRecord): void {
    if (tripOffer.status === TripOfferStatus.PUBLISHED) {
      return;
    }

    throw new ConflictException(
      'Bookings can only be created for trip offers in PUBLISHED status.',
    );
  }

  private ensureAvailableCapacity(
    availableCapacity: number,
    requestedUnits: number,
  ): void {
    if (requestedUnits > availableCapacity) {
      throw new ConflictException(BOOKING_INSUFFICIENT_CAPACITY_MESSAGE);
    }
  }

  private resolveStatusForAvailableCapacity(
    currentStatus: TripOfferStatus,
    availableCapacity: number,
  ): TripOfferStatus {
    if (
      currentStatus !== TripOfferStatus.PUBLISHED &&
      currentStatus !== TripOfferStatus.FULL
    ) {
      return currentStatus;
    }

    return availableCapacity === 0
      ? TripOfferStatus.FULL
      : TripOfferStatus.PUBLISHED;
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

  private toBookingDetailResponse(
    booking: BookingDetailRecord,
  ): BookingDetailResponseDto {
    return {
      id: booking.id,
      tripOfferId: booking.tripOfferId,
      requestedUnits: booking.requestedUnits,
      unitPriceSnapshot: booking.unitPriceSnapshot,
      totalPriceSnapshot: booking.totalPriceSnapshot,
      expiresAt: booking.expiresAt,
      status: booking.status ?? BookingStatus.PENDING_PAYMENT,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      tripOffer: {
        id: booking.tripOffer.id,
        originLabel: booking.tripOffer.originLabel,
        destinationLabel: booking.tripOffer.destinationLabel,
        departureDate: booking.tripOffer.departureDate,
        departureWindowStart: booking.tripOffer.departureWindowStart,
        departureWindowEnd: booking.tripOffer.departureWindowEnd,
        status: booking.tripOffer.status,
      },
    };
  }
}
