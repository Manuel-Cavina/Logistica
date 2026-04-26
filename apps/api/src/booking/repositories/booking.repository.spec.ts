import { BookingStatus, Prisma, TripOfferStatus } from '@logistica/database';
import { BookingRepository } from './booking.repository';

describe('BookingRepository', () => {
  const tx = {
    $queryRaw: jest.fn(),
    tripOffer: {
      update: jest.fn(),
    },
    booking: {
      findFirst: jest.fn(),
      create: jest.fn(),
      updateManyAndReturn: jest.fn(),
    },
  };
  const prisma = {
    booking: {
      findFirst: jest.fn(),
    },
  };

  let bookingRepository: BookingRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    bookingRepository = new BookingRepository(prisma as never);
  });

  it('finds the booking detail only when it belongs to the authenticated client', async () => {
    prisma.booking.findFirst.mockResolvedValue({
      id: 'cmabooking0000wqz5oy7k8ph1',
      tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
      requestedUnits: 2,
      unitPriceSnapshot: 120000,
      totalPriceSnapshot: 240000,
      expiresAt: new Date('2026-04-24T13:30:00.000Z'),
      status: BookingStatus.PENDING_PAYMENT,
      createdAt: new Date('2026-04-24T13:00:00.000Z'),
      updatedAt: new Date('2026-04-24T13:00:00.000Z'),
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

    await bookingRepository.findOwnedDetailById(
      'client-account-id',
      'cmabooking0000wqz5oy7k8ph1',
    );

    expect(prisma.booking.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'cmabooking0000wqz5oy7k8ph1',
        clientAccountId: 'client-account-id',
      },
      select: {
        id: true,
        tripOfferId: true,
        requestedUnits: true,
        unitPriceSnapshot: true,
        totalPriceSnapshot: true,
        expiresAt: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        tripOffer: {
          select: {
            id: true,
            originLabel: true,
            destinationLabel: true,
            departureDate: true,
            departureWindowStart: true,
            departureWindowEnd: true,
            status: true,
          },
        },
      },
    });
  });

  it('locks the trip offer row before consuming capacity', async () => {
    tx.$queryRaw.mockResolvedValue([
      {
        id: 'cmatripoffer0000wqz5oy7k8ph1',
        availableCapacity: 2,
        pricePerSlot: 120000,
        status: TripOfferStatus.PUBLISHED,
      },
    ]);

    await expect(
      bookingRepository.lockTripOfferById(
        'cmatripoffer0000wqz5oy7k8ph1',
        tx as never,
      ),
    ).resolves.toEqual({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      availableCapacity: 2,
      pricePerSlot: 120000,
      status: TripOfferStatus.PUBLISHED,
    });

    expect(tx.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('finds the owned booking data needed to cancel inside the transaction', async () => {
    tx.booking.findFirst.mockResolvedValue({
      id: 'cmabooking0000wqz5oy7k8ph1',
      tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
      clientAccountId: 'client-account-id',
      requestedUnits: 2,
      expiresAt: new Date('2026-04-24T13:30:00.000Z'),
      status: BookingStatus.PENDING_PAYMENT,
    });

    await bookingRepository.findOwnedBookingForCancellation(
      'client-account-id',
      'cmabooking0000wqz5oy7k8ph1',
      tx as never,
    );

    expect(tx.booking.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'cmabooking0000wqz5oy7k8ph1',
        clientAccountId: 'client-account-id',
      },
      select: {
        id: true,
        tripOfferId: true,
        clientAccountId: true,
        requestedUnits: true,
        expiresAt: true,
        status: true,
      },
    });
  });

  it('decrements availableCapacity and persists the resolved status in the same trip offer update', async () => {
    tx.tripOffer.update.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      availableCapacity: 0,
      pricePerSlot: 120000,
      status: TripOfferStatus.FULL,
    });

    await expect(
      bookingRepository.updateTripOfferCapacity(
        'cmatripoffer0000wqz5oy7k8ph1',
        2,
        TripOfferStatus.FULL,
        tx as never,
      ),
    ).resolves.toEqual({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      availableCapacity: 0,
      pricePerSlot: 120000,
      status: TripOfferStatus.FULL,
    });

    expect(tx.tripOffer.update).toHaveBeenCalledWith({
      where: { id: 'cmatripoffer0000wqz5oy7k8ph1' },
      data: {
        availableCapacity: {
          decrement: 2,
        },
        status: TripOfferStatus.FULL,
      },
      select: {
        id: true,
        capacityTotal: true,
        availableCapacity: true,
        pricePerSlot: true,
        status: true,
      },
    });
  });

  it('increments availableCapacity and persists the resolved status when a booking is cancelled', async () => {
    tx.tripOffer.update.mockResolvedValue({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      capacityTotal: 4,
      availableCapacity: 2,
      pricePerSlot: 120000,
      status: TripOfferStatus.PUBLISHED,
    });

    await expect(
      bookingRepository.releaseTripOfferCapacity(
        'cmatripoffer0000wqz5oy7k8ph1',
        2,
        TripOfferStatus.PUBLISHED,
        tx as never,
      ),
    ).resolves.toEqual({
      id: 'cmatripoffer0000wqz5oy7k8ph1',
      capacityTotal: 4,
      availableCapacity: 2,
      pricePerSlot: 120000,
      status: TripOfferStatus.PUBLISHED,
    });

    expect(tx.tripOffer.update).toHaveBeenCalledWith({
      where: { id: 'cmatripoffer0000wqz5oy7k8ph1' },
      data: {
        availableCapacity: {
          increment: 2,
        },
        status: TripOfferStatus.PUBLISHED,
      },
      select: {
        id: true,
        capacityTotal: true,
        availableCapacity: true,
        pricePerSlot: true,
        status: true,
      },
    });
  });

  it('cancels the booking only when it is still pending payment', async () => {
    const updatedAt = new Date('2026-04-24T13:05:00.000Z');

    tx.booking.updateManyAndReturn.mockResolvedValue([
      {
        id: 'cmabooking0000wqz5oy7k8ph1',
        tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
        clientAccountId: 'client-account-id',
        requestedUnits: 2,
        unitPriceSnapshot: 120000,
        totalPriceSnapshot: 240000,
        expiresAt: new Date('2026-04-24T13:30:00.000Z'),
        status: BookingStatus.CANCELLED,
        createdAt: new Date('2026-04-24T13:00:00.000Z'),
        updatedAt,
      },
    ]);

    await bookingRepository.cancelPendingBooking(
      'cmabooking0000wqz5oy7k8ph1',
      updatedAt,
      tx as never,
    );

    expect(tx.booking.updateManyAndReturn).toHaveBeenCalledWith({
      where: {
        id: 'cmabooking0000wqz5oy7k8ph1',
        status: BookingStatus.PENDING_PAYMENT,
      },
      data: {
        status: BookingStatus.CANCELLED,
        updatedAt,
      },
      select: {
        id: true,
        tripOfferId: true,
        clientAccountId: true,
        requestedUnits: true,
        unitPriceSnapshot: true,
        totalPriceSnapshot: true,
        expiresAt: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  it('creates the booking through the transaction client so booking creation participates in the same transaction', async () => {
    const expiresAt = new Date('2026-04-24T13:30:00.000Z');
    const createdAt = new Date('2026-04-24T13:00:00.000Z');

    tx.booking.create.mockResolvedValue({
      id: 'cmabooking0000wqz5oy7k8ph1',
      tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
      clientAccountId: 'client-account-id',
      requestedUnits: 2,
      unitPriceSnapshot: 120000,
      totalPriceSnapshot: 240000,
      expiresAt,
      status: BookingStatus.PENDING_PAYMENT,
      createdAt,
      updatedAt: createdAt,
    });

    await bookingRepository.create(
      {
        tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
        clientAccountId: 'client-account-id',
        requestedUnits: 2,
        unitPriceSnapshot: 120000,
        totalPriceSnapshot: 240000,
        expiresAt,
      },
      tx as never,
    );

    const [createArgs] = tx.booking.create.mock.calls[0] as [
      Prisma.BookingCreateArgs,
    ];

    expect(createArgs.data).toMatchObject({
      requestedUnits: 2,
      unitPriceSnapshot: 120000,
      totalPriceSnapshot: 240000,
      expiresAt,
      status: BookingStatus.PENDING_PAYMENT,
    });
  });
});
