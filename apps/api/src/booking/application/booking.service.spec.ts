import { ConflictException, NotFoundException } from '@nestjs/common';
import { BookingStatus, TripOfferStatus } from '@logistica/database';
import { BOOKING_INSUFFICIENT_CAPACITY_MESSAGE } from './booking.errors';
import { BookingService } from './booking.service';

describe('BookingService', () => {
  const bookingRepository = {
    lockTripOfferById: jest.fn(),
    updateTripOfferCapacity: jest.fn(),
    create: jest.fn(),
  };
  const prisma = {
    $transaction: jest.fn(),
  };
  const tx = {
    booking: {},
    tripOffer: {},
    $queryRaw: jest.fn(),
  };

  let bookingService: BookingService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(
      (callback: (transactionClient: typeof tx) => Promise<unknown>) =>
        callback(tx),
    );
    bookingService = new BookingService(
      bookingRepository as never,
      prisma as never,
    );
  });

  it('creates a booking in pending payment with price snapshots', async () => {
    const now = new Date('2026-04-24T13:00:00.000Z');
    const expiresAt = new Date('2026-04-24T13:30:00.000Z');

    jest.useFakeTimers().setSystemTime(now);

    bookingRepository.lockTripOfferById.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      availableCapacity: 4,
      pricePerSlot: 120000,
      status: TripOfferStatus.PUBLISHED,
    });
    bookingRepository.updateTripOfferCapacity.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      availableCapacity: 2,
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

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(bookingRepository.lockTripOfferById).toHaveBeenCalledWith(
      'cmatripoffer0000wqz5oy7k8ph1',
      tx,
    );
    expect(bookingRepository.updateTripOfferCapacity).toHaveBeenCalledWith(
      'cmatripoffer0000wqz5oy7k8ph1',
      2,
      TripOfferStatus.PUBLISHED,
      tx,
    );
    expect(bookingRepository.create).toHaveBeenCalledWith(
      {
        tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
        clientAccountId: 'client-account-id',
        requestedUnits: 2,
        unitPriceSnapshot: 120000,
        totalPriceSnapshot: 240000,
        expiresAt,
      },
      tx,
    );

    jest.useRealTimers();
  });

  it('throws when the trip offer does not exist', async () => {
    bookingRepository.lockTripOfferById.mockResolvedValue(null);

    await expect(
      bookingService.createBooking('client-account-id', {
        tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
        requestedUnits: 2,
      }),
    ).rejects.toThrow(NotFoundException);

    expect(bookingRepository.updateTripOfferCapacity).not.toHaveBeenCalled();
    expect(bookingRepository.create).not.toHaveBeenCalled();
  });

  it('throws when the trip offer is not published', async () => {
    bookingRepository.lockTripOfferById.mockResolvedValue({
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

    expect(bookingRepository.updateTripOfferCapacity).not.toHaveBeenCalled();
    expect(bookingRepository.create).not.toHaveBeenCalled();
  });

  it('calculates totalPriceSnapshot from unit price and requested units', async () => {
    const now = new Date('2026-04-24T13:00:00.000Z');
    const expiresAt = new Date('2026-04-24T13:30:00.000Z');

    jest.useFakeTimers().setSystemTime(now);

    bookingRepository.lockTripOfferById.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      availableCapacity: 5,
      pricePerSlot: 85000,
      status: TripOfferStatus.PUBLISHED,
    });
    bookingRepository.updateTripOfferCapacity.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      availableCapacity: 2,
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
      tx,
    );

    jest.useRealTimers();
  });

  it('sets expiresAt using the pending payment ttl', async () => {
    const now = new Date('2026-04-24T13:00:00.000Z');
    const expiresAt = new Date('2026-04-24T13:30:00.000Z');

    jest.useFakeTimers().setSystemTime(now);

    bookingRepository.lockTripOfferById.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      availableCapacity: 2,
      pricePerSlot: 120000,
      status: TripOfferStatus.PUBLISHED,
    });
    bookingRepository.updateTripOfferCapacity.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      availableCapacity: 1,
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
      tx,
    );

    jest.useRealTimers();
  });

  it('throws when requested units exceed available capacity', async () => {
    bookingRepository.lockTripOfferById.mockResolvedValue({
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

    expect(bookingRepository.updateTripOfferCapacity).not.toHaveBeenCalled();
    expect(bookingRepository.create).not.toHaveBeenCalled();
  });

  it('marks the trip offer as FULL when the remaining capacity reaches zero', async () => {
    const now = new Date('2026-04-24T13:00:00.000Z');

    jest.useFakeTimers().setSystemTime(now);

    bookingRepository.lockTripOfferById.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      availableCapacity: 2,
      pricePerSlot: 120000,
      status: TripOfferStatus.PUBLISHED,
    });
    bookingRepository.updateTripOfferCapacity.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      availableCapacity: 0,
      pricePerSlot: 120000,
      status: TripOfferStatus.FULL,
    });
    bookingRepository.create.mockResolvedValue({
      id: 'cmabooking0000wqz5oy7k8ph1',
      tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
      clientAccountId: 'client-account-id',
      requestedUnits: 2,
      unitPriceSnapshot: 120000,
      totalPriceSnapshot: 240000,
      expiresAt: new Date('2026-04-24T13:30:00.000Z'),
      status: BookingStatus.PENDING_PAYMENT,
      createdAt: now,
      updatedAt: now,
    });

    await bookingService.createBooking('client-account-id', {
      tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
      requestedUnits: 2,
    });

    expect(bookingRepository.updateTripOfferCapacity).toHaveBeenCalledWith(
      'cmatripoffer0000wqz5oy7k8ph1',
      2,
      TripOfferStatus.FULL,
      tx,
    );

    jest.useRealTimers();
  });

  it('propagates transactional failures after capacity consumption so the transaction can roll back', async () => {
    const now = new Date('2026-04-24T13:00:00.000Z');

    jest.useFakeTimers().setSystemTime(now);

    bookingRepository.lockTripOfferById.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      availableCapacity: 2,
      pricePerSlot: 120000,
      status: TripOfferStatus.PUBLISHED,
    });
    bookingRepository.updateTripOfferCapacity.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      availableCapacity: 0,
      pricePerSlot: 120000,
      status: TripOfferStatus.FULL,
    });
    bookingRepository.create.mockRejectedValue(new Error('db write failed'));

    await expect(
      bookingService.createBooking('client-account-id', {
        tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
        requestedUnits: 2,
      }),
    ).rejects.toThrow('db write failed');

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(bookingRepository.updateTripOfferCapacity).toHaveBeenCalledWith(
      'cmatripoffer0000wqz5oy7k8ph1',
      2,
      TripOfferStatus.FULL,
      tx,
    );
    expect(bookingRepository.create).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });
});
