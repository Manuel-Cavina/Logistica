import {
  type Prisma,
  TripOfferStatus,
  TransporterVerificationStatus,
} from '@logistica/database';
import { TripOfferRepository } from './trip-offer.repository';

describe('TripOfferRepository', () => {
  const prisma = {
    $transaction: jest.fn(),
    tripOffer: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  let tripOfferRepository: TripOfferRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    tripOfferRepository = new TripOfferRepository(prisma as never);
  });

  it('searches only published offers matching origin, destination, capacity, and date filters', async () => {
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

    expect(prisma.tripOffer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: TripOfferStatus.PUBLISHED,
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
        orderBy: [
          { departureDate: 'asc' },
          { createdAt: 'desc' },
          { id: 'asc' },
        ],
        skip: 5,
        take: 5,
      }),
    );
    expect(prisma.tripOffer.count).toHaveBeenCalledWith({
      where: {
        status: TripOfferStatus.PUBLISHED,
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

  it('applies price, verification, and detour filters before pagination', async () => {
    prisma.tripOffer.findMany.mockReturnValue('findMany-operation');
    prisma.tripOffer.count.mockReturnValue('count-operation');
    prisma.$transaction.mockResolvedValue([[], 0]);

    await tripOfferRepository.searchPublic({
      origin: 'Buenos Aires',
      destination: 'Rosario',
      date: new Date('2026-05-01T15:24:00.000Z'),
      requiredCapacity: 2,
      minPrice: 100000,
      maxPrice: 150000,
      verifiedOnly: true,
      maxDetourKm: 80,
      page: 1,
      limit: 10,
    });

    expect(prisma.tripOffer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: TripOfferStatus.PUBLISHED,
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
          pricePerSlot: {
            gte: 100000,
            lte: 150000,
          },
          transporterProfile: {
            verificationStatus: TransporterVerificationStatus.VERIFIED,
          },
          maxDetourKm: {
            lte: 80,
          },
          departureDate: {
            gte: new Date('2026-05-01T00:00:00.000Z'),
            lt: new Date('2026-05-02T00:00:00.000Z'),
          },
        },
        orderBy: [
          { departureDate: 'asc' },
          { createdAt: 'desc' },
          { id: 'asc' },
        ],
        skip: 0,
        take: 10,
      }),
    );
    expect(prisma.tripOffer.count).toHaveBeenCalledWith({
      where: {
        status: TripOfferStatus.PUBLISHED,
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
        pricePerSlot: {
          gte: 100000,
          lte: 150000,
        },
        transporterProfile: {
          verificationStatus: TransporterVerificationStatus.VERIFIED,
        },
        maxDetourKm: {
          lte: 80,
        },
        departureDate: {
          gte: new Date('2026-05-01T00:00:00.000Z'),
          lt: new Date('2026-05-02T00:00:00.000Z'),
        },
      },
    });
  });

  it('orders public search results by price using the requested sort order', async () => {
    prisma.tripOffer.findMany.mockReturnValue('findMany-operation');
    prisma.tripOffer.count.mockReturnValue('count-operation');
    prisma.$transaction.mockResolvedValue([[], 0]);

    await tripOfferRepository.searchPublic({
      origin: 'Buenos Aires',
      destination: 'Rosario',
      date: new Date('2026-05-01T15:24:00.000Z'),
      requiredCapacity: 2,
      sortBy: 'price',
      sortOrder: 'desc',
      page: 1,
      limit: 10,
    });

    expect(prisma.tripOffer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [
          { pricePerSlot: 'desc' },
          { departureDate: 'asc' },
          { id: 'asc' },
        ],
      }),
    );
  });

  it('orders public search results by proximity using maxDetourKm as the current approximation', async () => {
    prisma.tripOffer.findMany.mockReturnValue('findMany-operation');
    prisma.tripOffer.count.mockReturnValue('count-operation');
    prisma.$transaction.mockResolvedValue([[], 0]);

    await tripOfferRepository.searchPublic({
      origin: 'Buenos Aires',
      destination: 'Rosario',
      date: new Date('2026-05-01T15:24:00.000Z'),
      requiredCapacity: 2,
      sortBy: 'proximity',
      page: 1,
      limit: 10,
    });

    expect(prisma.tripOffer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [
          { maxDetourKm: 'asc' },
          { departureDate: 'asc' },
          { id: 'asc' },
        ],
      }),
    );
  });

  it('orders public search results by rating using the stable fallback while no aggregate rating exists', async () => {
    prisma.tripOffer.findMany.mockReturnValue('findMany-operation');
    prisma.tripOffer.count.mockReturnValue('count-operation');
    prisma.$transaction.mockResolvedValue([[], 0]);

    await tripOfferRepository.searchPublic({
      origin: 'Buenos Aires',
      destination: 'Rosario',
      date: new Date('2026-05-01T15:24:00.000Z'),
      requiredCapacity: 2,
      sortBy: 'rating',
      page: 1,
      limit: 10,
    });

    expect(prisma.tripOffer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ departureDate: 'asc' }, { id: 'asc' }],
      }),
    );
  });

  it('reuses the final filtered query for items and total while paginating the requested page', async () => {
    prisma.tripOffer.findMany.mockReturnValue('findMany-operation');
    prisma.tripOffer.count.mockReturnValue('count-operation');
    prisma.$transaction.mockResolvedValue([[], 0]);

    await tripOfferRepository.searchPublic({
      origin: 'Buenos Aires',
      destination: 'Rosario',
      date: new Date('2026-05-01T15:24:00.000Z'),
      requiredCapacity: 2,
      sortBy: 'price',
      sortOrder: 'asc',
      page: 3,
      limit: 2,
    });

    const findManyCalls = prisma.tripOffer.findMany.mock.calls as [
      [Prisma.TripOfferFindManyArgs],
    ];
    const countCalls = prisma.tripOffer.count.mock.calls as [
      [Prisma.TripOfferCountArgs],
    ];
    const [findManyArgs] = findManyCalls[0];
    const [countArgs] = countCalls[0];

    expect(findManyArgs.where).toBe(countArgs.where);
    expect(findManyArgs.orderBy).toEqual([
      { pricePerSlot: 'asc' },
      { departureDate: 'asc' },
      { id: 'asc' },
    ]);
    expect(findManyArgs.skip).toBe(4);
    expect(findManyArgs.take).toBe(2);
  });

  it('loads the public trip offer detail using a published-only public select', async () => {
    prisma.tripOffer.findFirst.mockResolvedValue(null);

    await tripOfferRepository.findPublicById('cm9tripoffer0000wqz5oy7k8ph1');

    expect(prisma.tripOffer.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'cm9tripoffer0000wqz5oy7k8ph1',
        status: TripOfferStatus.PUBLISHED,
      },
      select: {
        id: true,
        originLabel: true,
        destinationLabel: true,
        departureDate: true,
        departureWindowStart: true,
        departureWindowEnd: true,
        availableCapacity: true,
        pricePerSlot: true,
        maxDetourKm: true,
        notes: true,
        cancellationPolicy: true,
        transporterProfile: {
          select: {
            id: true,
            displayName: true,
            verificationStatus: true,
          },
        },
      },
    });
  });
});
