import { ConflictException, NotFoundException } from '@nestjs/common';
import { BookingStatus, TripOfferStatus } from '@logistica/database';
import { BOOKING_INSUFFICIENT_CAPACITY_MESSAGE } from './booking.errors';
import { BookingService } from './booking.service';

describe('BookingService', () => {
  const bookingRepository = {
    findTripOfferById: jest.fn(),
    create: jest.fn(),
  };

  let bookingService: BookingService;

  beforeEach(() => {
    jest.clearAllMocks();
    bookingService = new BookingService(bookingRepository as never);
  });

  it('creates a booking in pending payment with price snapshots', async () => {
    const now = new Date('2026-04-24T13:00:00.000Z');
    const expiresAt = new Date('2026-04-24T13:30:00.000Z');

    jest.useFakeTimers().setSystemTime(now);

    bookingRepository.findTripOfferById.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      availableCapacity: 4,
      pricePerSlot: 120000,
      status: TripOfferStatus.PUBLISHED,
    });
    bookingRepository.create.mockResolvedValue({
      id: 'cmabooking0000wqz5oy7k8ph1',
      tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
      clientAccountId: 'client-account-id',
      requestedUnits: 2,
      unitPriceSnapshot: 120000,
      totalPriceSnapshot: 240000,
      expiresAt,
      status: BookingStatus.PENDING_PAYMENT,
      createdAt: now,
      updatedAt: now,
    });

    await expect(
      bookingService.createBooking('client-account-id', {
        tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
        requestedUnits: 2,
      }),
    ).resolves.toEqual({
      id: 'cmabooking0000wqz5oy7k8ph1',
      tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
      clientAccountId: 'client-account-id',
      requestedUnits: 2,
      unitPriceSnapshot: 120000,
      totalPriceSnapshot: 240000,
      expiresAt,
      status: BookingStatus.PENDING_PAYMENT,
      createdAt: now,
      updatedAt: now,
    });

    expect(bookingRepository.findTripOfferById).toHaveBeenCalledWith(
      'cmatripoffer0000wqz5oy7k8ph1',
    );
    expect(bookingRepository.create).toHaveBeenCalledWith({
      tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
      clientAccountId: 'client-account-id',
      requestedUnits: 2,
      unitPriceSnapshot: 120000,
      totalPriceSnapshot: 240000,
      expiresAt,
    });

    jest.useRealTimers();
  });

  it('throws when the trip offer does not exist', async () => {
    bookingRepository.findTripOfferById.mockResolvedValue(null);

    await expect(
      bookingService.createBooking('client-account-id', {
        tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
        requestedUnits: 2,
      }),
    ).rejects.toThrow(NotFoundException);

    expect(bookingRepository.create).not.toHaveBeenCalled();
  });

  it('throws when the trip offer is not published', async () => {
    bookingRepository.findTripOfferById.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      availableCapacity: 4,
      pricePerSlot: 120000,
      status: TripOfferStatus.DRAFT,
    });

    await expect(
      bookingService.createBooking('client-account-id', {
        tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
        requestedUnits: 2,
      }),
    ).rejects.toThrow(ConflictException);

    expect(bookingRepository.create).not.toHaveBeenCalled();
  });

  it('calculates totalPriceSnapshot from unit price and requested units', async () => {
    const now = new Date('2026-04-24T13:00:00.000Z');
    const expiresAt = new Date('2026-04-24T13:30:00.000Z');

    jest.useFakeTimers().setSystemTime(now);

    bookingRepository.findTripOfferById.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      availableCapacity: 5,
      pricePerSlot: 85000,
      status: TripOfferStatus.PUBLISHED,
    });
    bookingRepository.create.mockResolvedValue({
      id: 'cmabooking0000wqz5oy7k8ph1',
      tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
      clientAccountId: 'client-account-id',
      requestedUnits: 3,
      unitPriceSnapshot: 85000,
      totalPriceSnapshot: 255000,
      expiresAt,
      status: BookingStatus.PENDING_PAYMENT,
      createdAt: now,
      updatedAt: now,
    });

    await bookingService.createBooking('client-account-id', {
      tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
      requestedUnits: 3,
    });

    expect(bookingRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        totalPriceSnapshot: 255000,
      }),
    );

    jest.useRealTimers();
  });

  it('sets expiresAt using the pending payment ttl', async () => {
    const now = new Date('2026-04-24T13:00:00.000Z');
    const expiresAt = new Date('2026-04-24T13:30:00.000Z');

    jest.useFakeTimers().setSystemTime(now);

    bookingRepository.findTripOfferById.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      availableCapacity: 2,
      pricePerSlot: 120000,
      status: TripOfferStatus.PUBLISHED,
    });
    bookingRepository.create.mockResolvedValue({
      id: 'cmabooking0000wqz5oy7k8ph1',
      tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
      clientAccountId: 'client-account-id',
      requestedUnits: 1,
      unitPriceSnapshot: 120000,
      totalPriceSnapshot: 120000,
      expiresAt,
      status: BookingStatus.PENDING_PAYMENT,
      createdAt: now,
      updatedAt: now,
    });

    await bookingService.createBooking('client-account-id', {
      tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
      requestedUnits: 1,
    });

    expect(bookingRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        expiresAt,
      }),
    );

    jest.useRealTimers();
  });

  it('throws when requested units exceed available capacity', async () => {
    bookingRepository.findTripOfferById.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      availableCapacity: 1,
      pricePerSlot: 120000,
      status: TripOfferStatus.PUBLISHED,
    });

    await expect(
      bookingService.createBooking('client-account-id', {
        tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
        requestedUnits: 2,
      }),
    ).rejects.toMatchObject({
      response: {
        error: 'Conflict',
        message: BOOKING_INSUFFICIENT_CAPACITY_MESSAGE,
        statusCode: 409,
      },
      status: 409,
    });

    expect(bookingRepository.create).not.toHaveBeenCalled();
  });
});
