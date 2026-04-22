import { TripOfferStatus } from '@logistica/database';
import { TripOfferRepository } from './trip-offer.repository';

describe('TripOfferRepository', () => {
  const prisma = {
    $transaction: jest.fn(),
    tripOffer: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  let tripOfferRepository: TripOfferRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    tripOfferRepository = new TripOfferRepository(prisma as never);
  });

  it('searches only public offers matching capacity and date filters', async () => {
    prisma.tripOffer.findMany.mockReturnValue('findMany-operation');
    prisma.tripOffer.count.mockReturnValue('count-operation');
    prisma.$transaction.mockResolvedValue([[], 0]);

    await tripOfferRepository.searchPublic({
      origin: 'Buenos Aires',
      destination: 'Rosario',
      date: new Date('2026-05-01T15:24:00.000Z'),
      requiredCapacity: 2,
      page: 2,
      limit: 5,
    });

    expect(prisma.tripOffer.findMany).toHaveBeenCalledWith({
      where: {
        status: {
          in: [TripOfferStatus.PUBLISHED, TripOfferStatus.FULL],
        },
        originLabel: {
          contains: 'Buenos Aires',
          mode: 'insensitive',
        },
        destinationLabel: {
          contains: 'Rosario',
          mode: 'insensitive',
        },
        availableCapacity: {
          gte: 2,
        },
        departureDate: {
          gte: new Date('2026-05-01T00:00:00.000Z'),
          lt: new Date('2026-05-02T00:00:00.000Z'),
        },
      },
      orderBy: [{ departureDate: 'asc' }, { createdAt: 'desc' }],
      skip: 5,
      take: 5,
      select: expect.any(Object),
    });
    expect(prisma.tripOffer.count).toHaveBeenCalledWith({
      where: {
        status: {
          in: [TripOfferStatus.PUBLISHED, TripOfferStatus.FULL],
        },
        originLabel: {
          contains: 'Buenos Aires',
          mode: 'insensitive',
        },
        destinationLabel: {
          contains: 'Rosario',
          mode: 'insensitive',
        },
        availableCapacity: {
          gte: 2,
        },
        departureDate: {
          gte: new Date('2026-05-01T00:00:00.000Z'),
          lt: new Date('2026-05-02T00:00:00.000Z'),
        },
      },
    });
    expect(prisma.$transaction).toHaveBeenCalledWith([
      'findMany-operation',
      'count-operation',
    ]);
  });
});
