import { ConflictException, NotFoundException } from '@nestjs/common';
import { BookingStatus, TripOfferStatus } from '@logistica/database';
import {
  BOOKING_CANCELLATION_NOT_ALLOWED_MESSAGE,
  BOOKING_INSUFFICIENT_CAPACITY_MESSAGE,
  BOOKING_NOT_FOUND_FOR_ACCOUNT_MESSAGE,
} from './booking.errors';
import { BookingService } from './booking.service';

describe('BookingService', () => {
  const bookingRepository = {
    findOwnedDetailById: jest.fn(),
    findOwnedBookingForCancellation: jest.fn(),
    lockTripOfferById: jest.fn(),
    expirePendingBookingsForTripOffer: jest.fn(),
    updateTripOfferAvailability: jest.fn(),
    updateTripOfferCapacity: jest.fn(),
    releaseTripOfferCapacity: jest.fn(),
    cancelPendingBooking: jest.fn(),
    create: jest.fn(),
  };
  const prisma = {
    $transaction: jest.fn(),
  };
  const configService = {
    get: jest.fn(),
  };
  const tx = {
    booking: {},
    tripOffer: {},
    $queryRaw: jest.fn(),
  };

  let bookingService: BookingService;

  beforeEach(() => {
    jest.clearAllMocks();
    configService.get.mockReturnValue('30');
    prisma.$transaction.mockImplementation(
      (callback: (transactionClient: typeof tx) => Promise<unknown>) =>
        callback(tx),
    );
    bookingService = new BookingService(
      bookingRepository as never,
      prisma as never,
      configService as never,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates a booking in pending payment with price snapshots', async () => {
    const now = new Date('2026-04-24T13:00:00.000Z');
    const expiresAt = new Date('2026-04-24T13:30:00.000Z');

    jest.useFakeTimers().setSystemTime(now);

    bookingRepository.lockTripOfferById.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      capacityTotal: 4,
      availableCapacity: 4,
      pricePerSlot: 120000,
      status: TripOfferStatus.PUBLISHED,
    });
    bookingRepository.expirePendingBookingsForTripOffer.mockResolvedValue(0);
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
    expect(
      bookingRepository.expirePendingBookingsForTripOffer,
    ).toHaveBeenCalledWith('cmatripoffer0000wqz5oy7k8ph1', now, tx);
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
  });

  it('returns the detail for a booking owned by the authenticated client', async () => {
    const createdAt = new Date('2026-04-24T13:00:00.000Z');
    const expiresAt = new Date('2026-04-24T13:30:00.000Z');

    bookingRepository.findOwnedDetailById.mockResolvedValue({
      id: 'cmabooking0000wqz5oy7k8ph1',
      tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
      requestedUnits: 2,
      unitPriceSnapshot: 120000,
      totalPriceSnapshot: 240000,
      expiresAt,
      status: BookingStatus.PENDING_PAYMENT,
      createdAt,
      updatedAt: createdAt,
      tripOffer: {
        id: 'cmatripoffer0000wqz5oy7k8ph1',
        originLabel: 'Buenos Aires',
        destinationLabel: 'Rosario',
        departureDate: new Date('2026-04-25T10:00:00.000Z'),
        departureWindowStart: null,
        departureWindowEnd: null,
        status: TripOfferStatus.PUBLISHED,
      },
    });

    await expect(
      bookingService.getOwnBookingById(
        'client-account-id',
        'cmabooking0000wqz5oy7k8ph1',
      ),
    ).resolves.toEqual({
      id: 'cmabooking0000wqz5oy7k8ph1',
      tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
      requestedUnits: 2,
      unitPriceSnapshot: 120000,
      totalPriceSnapshot: 240000,
      expiresAt,
      status: BookingStatus.PENDING_PAYMENT,
      createdAt,
      updatedAt: createdAt,
      tripOffer: {
        id: 'cmatripoffer0000wqz5oy7k8ph1',
        originLabel: 'Buenos Aires',
        destinationLabel: 'Rosario',
        departureDate: new Date('2026-04-25T10:00:00.000Z'),
        departureWindowStart: null,
        departureWindowEnd: null,
        status: TripOfferStatus.PUBLISHED,
      },
    });

    expect(bookingRepository.findOwnedDetailById).toHaveBeenCalledWith(
      'client-account-id',
      'cmabooking0000wqz5oy7k8ph1',
    );
  });

  it('throws when the booking does not exist for the authenticated client', async () => {
    bookingRepository.findOwnedDetailById.mockResolvedValue(null);

    await expect(
      bookingService.getOwnBookingById(
        'client-account-id',
        'cmabooking0000wqz5oy7k8ph1',
      ),
    ).rejects.toThrow(
      new NotFoundException(BOOKING_NOT_FOUND_FOR_ACCOUNT_MESSAGE),
    );
  });

  it('throws the same not found response when the booking belongs to another client', async () => {
    bookingRepository.findOwnedDetailById.mockResolvedValue(null);

    await expect(
      bookingService.getOwnBookingById(
        'another-client-account-id',
        'cmabooking0000wqz5oy7k8ph1',
      ),
    ).rejects.toThrow(
      new NotFoundException(BOOKING_NOT_FOUND_FOR_ACCOUNT_MESSAGE),
    );

    expect(bookingRepository.findOwnedDetailById).toHaveBeenCalledWith(
      'another-client-account-id',
      'cmabooking0000wqz5oy7k8ph1',
    );
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

  it('cancels a pending booking and releases its capacity atomically', async () => {
    const now = new Date('2026-04-24T13:00:00.000Z');

    jest.useFakeTimers().setSystemTime(now);

    bookingRepository.findOwnedBookingForCancellation.mockResolvedValue({
      id: 'cmabooking0000wqz5oy7k8ph1',
      tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
      clientAccountId: 'client-account-id',
      requestedUnits: 2,
      expiresAt: new Date('2026-04-24T13:30:00.000Z'),
      status: BookingStatus.PENDING_PAYMENT,
    });
    bookingRepository.lockTripOfferById.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      capacityTotal: 4,
      availableCapacity: 0,
      pricePerSlot: 120000,
      status: TripOfferStatus.FULL,
    });
    bookingRepository.cancelPendingBooking.mockResolvedValue({
      id: 'cmabooking0000wqz5oy7k8ph1',
      tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
      clientAccountId: 'client-account-id',
      requestedUnits: 2,
      unitPriceSnapshot: 120000,
      totalPriceSnapshot: 240000,
      expiresAt: new Date('2026-04-24T13:30:00.000Z'),
      status: BookingStatus.CANCELLED,
      createdAt: new Date('2026-04-24T12:50:00.000Z'),
      updatedAt: now,
    });
    bookingRepository.releaseTripOfferCapacity.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      capacityTotal: 4,
      availableCapacity: 2,
      pricePerSlot: 120000,
      status: TripOfferStatus.PUBLISHED,
    });

    await expect(
      bookingService.cancelOwnBooking(
        'client-account-id',
        'cmabooking0000wqz5oy7k8ph1',
      ),
    ).resolves.toMatchObject({
      id: 'cmabooking0000wqz5oy7k8ph1',
      status: BookingStatus.CANCELLED,
      requestedUnits: 2,
    });

    expect(
      bookingRepository.findOwnedBookingForCancellation,
    ).toHaveBeenCalledWith(
      'client-account-id',
      'cmabooking0000wqz5oy7k8ph1',
      tx,
    );
    expect(bookingRepository.cancelPendingBooking).toHaveBeenCalledWith(
      'cmabooking0000wqz5oy7k8ph1',
      now,
      tx,
    );
    expect(bookingRepository.releaseTripOfferCapacity).toHaveBeenCalledWith(
      'cmatripoffer0000wqz5oy7k8ph1',
      2,
      TripOfferStatus.PUBLISHED,
      tx,
    );
  });

  it('throws when the booking is not found for cancellation', async () => {
    bookingRepository.findOwnedBookingForCancellation.mockResolvedValue(null);

    await expect(
      bookingService.cancelOwnBooking(
        'client-account-id',
        'cmabooking0000wqz5oy7k8ph1',
      ),
    ).rejects.toThrow(
      new NotFoundException(BOOKING_NOT_FOUND_FOR_ACCOUNT_MESSAGE),
    );

    expect(bookingRepository.lockTripOfferById).not.toHaveBeenCalled();
    expect(bookingRepository.cancelPendingBooking).not.toHaveBeenCalled();
  });

  it('throws when the booking status is not cancellable', async () => {
    bookingRepository.findOwnedBookingForCancellation.mockResolvedValue({
      id: 'cmabooking0000wqz5oy7k8ph1',
      tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
      clientAccountId: 'client-account-id',
      requestedUnits: 2,
      expiresAt: new Date('2026-04-24T13:30:00.000Z'),
      status: BookingStatus.CANCELLED,
    });

    await expect(
      bookingService.cancelOwnBooking(
        'client-account-id',
        'cmabooking0000wqz5oy7k8ph1',
      ),
    ).rejects.toThrow(
      new ConflictException(BOOKING_CANCELLATION_NOT_ALLOWED_MESSAGE),
    );

    expect(bookingRepository.lockTripOfferById).not.toHaveBeenCalled();
    expect(bookingRepository.releaseTripOfferCapacity).not.toHaveBeenCalled();
  });

  it('throws when cancellation loses the race and the booking was already updated', async () => {
    const now = new Date('2026-04-24T13:00:00.000Z');

    jest.useFakeTimers().setSystemTime(now);

    bookingRepository.findOwnedBookingForCancellation.mockResolvedValue({
      id: 'cmabooking0000wqz5oy7k8ph1',
      tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
      clientAccountId: 'client-account-id',
      requestedUnits: 2,
      expiresAt: new Date('2026-04-24T13:30:00.000Z'),
      status: BookingStatus.PENDING_PAYMENT,
    });
    bookingRepository.lockTripOfferById.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      capacityTotal: 4,
      availableCapacity: 1,
      pricePerSlot: 120000,
      status: TripOfferStatus.PUBLISHED,
    });
    bookingRepository.cancelPendingBooking.mockResolvedValue(null);

    await expect(
      bookingService.cancelOwnBooking(
        'client-account-id',
        'cmabooking0000wqz5oy7k8ph1',
      ),
    ).rejects.toThrow(
      new ConflictException(BOOKING_CANCELLATION_NOT_ALLOWED_MESSAGE),
    );

    expect(bookingRepository.releaseTripOfferCapacity).not.toHaveBeenCalled();
  });

  it('throws when the trip offer is not published after cleanup', async () => {
    bookingRepository.lockTripOfferById.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      capacityTotal: 4,
      availableCapacity: 4,
      pricePerSlot: 120000,
      status: TripOfferStatus.DRAFT,
    });
    bookingRepository.expirePendingBookingsForTripOffer.mockResolvedValue(0);

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

    jest.useFakeTimers().setSystemTime(now);

    bookingRepository.lockTripOfferById.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      capacityTotal: 5,
      availableCapacity: 5,
      pricePerSlot: 85000,
      status: TripOfferStatus.PUBLISHED,
    });
    bookingRepository.expirePendingBookingsForTripOffer.mockResolvedValue(0);
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
      expiresAt: new Date('2026-04-24T13:30:00.000Z'),
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
  });

  it('sets expiresAt using the pending payment ttl', async () => {
    const now = new Date('2026-04-24T13:00:00.000Z');
    const expiresAt = new Date('2026-04-24T13:30:00.000Z');

    jest.useFakeTimers().setSystemTime(now);

    bookingRepository.lockTripOfferById.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      capacityTotal: 2,
      availableCapacity: 2,
      pricePerSlot: 120000,
      status: TripOfferStatus.PUBLISHED,
    });
    bookingRepository.expirePendingBookingsForTripOffer.mockResolvedValue(0);
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
  });

  it('uses the configured pending payment ttl', async () => {
    const now = new Date('2026-04-24T13:00:00.000Z');
    const expiresAt = new Date('2026-04-24T13:45:00.000Z');

    configService.get.mockReturnValue('45');
    bookingService = new BookingService(
      bookingRepository as never,
      prisma as never,
      configService as never,
    );
    jest.useFakeTimers().setSystemTime(now);

    bookingRepository.lockTripOfferById.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      capacityTotal: 2,
      availableCapacity: 2,
      pricePerSlot: 120000,
      status: TripOfferStatus.PUBLISHED,
    });
    bookingRepository.expirePendingBookingsForTripOffer.mockResolvedValue(0);
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
  });

  it('expires pending bookings before checking capacity and restores FULL offers to PUBLISHED', async () => {
    const now = new Date('2026-04-24T13:00:00.000Z');

    jest.useFakeTimers().setSystemTime(now);

    bookingRepository.lockTripOfferById.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      capacityTotal: 3,
      availableCapacity: 0,
      pricePerSlot: 120000,
      status: TripOfferStatus.FULL,
    });
    bookingRepository.expirePendingBookingsForTripOffer.mockResolvedValue(2);
    bookingRepository.updateTripOfferCapacity.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      capacityTotal: 3,
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
      expiresAt: new Date('2026-04-24T13:30:00.000Z'),
      status: BookingStatus.PENDING_PAYMENT,
      createdAt: now,
      updatedAt: now,
    });

    await bookingService.createBooking('client-account-id', {
      tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
      requestedUnits: 1,
    });

    expect(
      bookingRepository.updateTripOfferAvailability,
    ).toHaveBeenNthCalledWith(
      1,
      'cmatripoffer0000wqz5oy7k8ph1',
      2,
      TripOfferStatus.PUBLISHED,
      tx,
    );
    expect(bookingRepository.updateTripOfferCapacity).toHaveBeenNthCalledWith(
      1,
      'cmatripoffer0000wqz5oy7k8ph1',
      1,
      TripOfferStatus.PUBLISHED,
      tx,
    );
  });

  it('throws when requested units exceed available capacity after cleanup', async () => {
    bookingRepository.lockTripOfferById.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      capacityTotal: 3,
      availableCapacity: 1,
      pricePerSlot: 120000,
      status: TripOfferStatus.PUBLISHED,
    });
    bookingRepository.expirePendingBookingsForTripOffer.mockResolvedValue(0);

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

  it('does not release capacity when there are no expired pending bookings', async () => {
    const now = new Date('2026-04-24T13:00:00.000Z');

    jest.useFakeTimers().setSystemTime(now);

    bookingRepository.lockTripOfferById.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      capacityTotal: 2,
      availableCapacity: 2,
      pricePerSlot: 120000,
      status: TripOfferStatus.PUBLISHED,
    });
    bookingRepository.expirePendingBookingsForTripOffer.mockResolvedValue(0);
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
      expiresAt: new Date('2026-04-24T13:30:00.000Z'),
      status: BookingStatus.PENDING_PAYMENT,
      createdAt: now,
      updatedAt: now,
    });

    await bookingService.createBooking('client-account-id', {
      tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
      requestedUnits: 1,
    });

    expect(
      bookingRepository.updateTripOfferAvailability,
    ).not.toHaveBeenCalled();
    expect(
      bookingRepository.expirePendingBookingsForTripOffer,
    ).toHaveBeenCalledTimes(1);
  });

  it('marks the trip offer as FULL when the remaining capacity reaches zero', async () => {
    const now = new Date('2026-04-24T13:00:00.000Z');

    jest.useFakeTimers().setSystemTime(now);

    bookingRepository.lockTripOfferById.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      capacityTotal: 2,
      availableCapacity: 2,
      pricePerSlot: 120000,
      status: TripOfferStatus.PUBLISHED,
    });
    bookingRepository.expirePendingBookingsForTripOffer.mockResolvedValue(0);
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
  });

  it('propagates transactional failures after capacity consumption so the transaction can roll back', async () => {
    const now = new Date('2026-04-24T13:00:00.000Z');

    jest.useFakeTimers().setSystemTime(now);

    bookingRepository.lockTripOfferById.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      capacityTotal: 2,
      availableCapacity: 2,
      pricePerSlot: 120000,
      status: TripOfferStatus.PUBLISHED,
    });
    bookingRepository.expirePendingBookingsForTripOffer.mockResolvedValue(0);
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
  });

  it('rejects invalid ttl configuration', () => {
    configService.get.mockReturnValue('0');

    expect(
      () =>
        new BookingService(
          bookingRepository as never,
          prisma as never,
          configService as never,
        ),
    ).toThrow(
      'BOOKING_PENDING_PAYMENT_TTL_MINUTES must be a positive integer.',
    );
  });
});
