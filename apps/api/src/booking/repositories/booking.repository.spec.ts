import { BookingStatus, Prisma, TripOfferStatus } from '@logistica/database';
import { BookingRepository } from './booking.repository';

describe('BookingRepository', () => {
  const tx = {
    $queryRaw: jest.fn(),
    tripOffer: {
      update: jest.fn(),
    },
    booking: {
      create: jest.fn(),
    },
  };
  const prisma = {};

  let bookingRepository: BookingRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    bookingRepository = new BookingRepository(prisma as never);
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
        availableCapacity: true,
        pricePerSlot: true,
        status: true,
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
