import { resolve } from 'node:path';
import { ConflictException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { config as loadEnv } from 'dotenv';
import {
  AccountRole,
  BookingStatus,
  Prisma,
  PrismaService,
  TripOfferStatus,
} from '@logistica/database';
import { BookingService } from './booking.service';
import { BookingRepository } from '../repositories/booking.repository';

loadEnv({ path: resolve(process.cwd(), '../../.env') });

describe('BookingService concurrency integration', () => {
  jest.setTimeout(30000);

  let prisma: PrismaService;
  let bookingService: BookingService;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();

    const bookingRepository = new BookingRepository(prisma);
    const configService = {
      get: jest
        .fn()
        .mockImplementation((key: string) =>
          key === 'BOOKING_PENDING_PAYMENT_TTL_MINUTES' ? '30' : undefined,
        ),
    } satisfies Pick<ConfigService, 'get'>;

    bookingService = new BookingService(
      bookingRepository,
      prisma,
      configService as unknown as ConfigService,
    );
  });

  beforeEach(async () => {
    await cleanupDatabase(prisma);
  });

  afterAll(async () => {
    await cleanupDatabase(prisma);
    await prisma.$disconnect();
  });

  it('allows only one successful booking when two clients compete for the last available unit', async () => {
    const transporter = await createTransporter(
      prisma,
      'concurrency-transporter',
    );
    const [firstClient, secondClient] = await Promise.all([
      createClient(prisma, 'concurrency-client-1'),
      createClient(prisma, 'concurrency-client-2'),
    ]);
    const tripOffer = await createTripOffer(prisma, transporter.id, {
      capacityTotal: 1,
      availableCapacity: 1,
      status: TripOfferStatus.PUBLISHED,
    });

    const attempts = await Promise.allSettled([
      bookingService.createBooking(firstClient.id, {
        tripOfferId: tripOffer.id,
        requestedUnits: 1,
      }),
      bookingService.createBooking(secondClient.id, {
        tripOfferId: tripOffer.id,
        requestedUnits: 1,
      }),
    ]);

    const successfulAttempts = attempts.filter((attempt) => {
      return attempt.status === 'fulfilled';
    });
    const failedAttempts = attempts.filter(
      (attempt): attempt is PromiseRejectedResult =>
        attempt.status === 'rejected',
    );

    expect(successfulAttempts).toHaveLength(1);
    expect(failedAttempts).toHaveLength(1);
    expect(failedAttempts[0].reason).toBeInstanceOf(ConflictException);
    expect(failedAttempts[0].reason).toMatchObject({
      response: {
        statusCode: 409,
      },
      status: 409,
    });

    const persistedBookings = await prisma.booking.findMany({
      where: {
        tripOfferId: tripOffer.id,
      },
      select: {
        id: true,
        clientAccountId: true,
        requestedUnits: true,
        status: true,
      },
    });
    const persistedTripOffer = await prisma.tripOffer.findUniqueOrThrow({
      where: {
        id: tripOffer.id,
      },
      select: {
        availableCapacity: true,
        capacityTotal: true,
        status: true,
      },
    });

    expect(persistedBookings).toHaveLength(1);
    expect(persistedBookings[0]).toMatchObject({
      requestedUnits: 1,
      status: BookingStatus.PENDING_PAYMENT,
    });
    expect(persistedTripOffer).toEqual({
      availableCapacity: 0,
      capacityTotal: 1,
      status: TripOfferStatus.FULL,
    });
    expect(persistedTripOffer.availableCapacity).toBeGreaterThanOrEqual(0);
  });

  it('releases capacity and restores the offer to PUBLISHED when a pending booking is cancelled', async () => {
    const transporter = await createTransporter(prisma, 'cancel-transporter');
    const client = await createClient(prisma, 'cancel-client');
    const tripOffer = await createTripOffer(prisma, transporter.id, {
      capacityTotal: 1,
      availableCapacity: 1,
      status: TripOfferStatus.PUBLISHED,
    });
    const createdBooking = await bookingService.createBooking(client.id, {
      tripOfferId: tripOffer.id,
      requestedUnits: 1,
    });

    const cancelledBooking = await bookingService.cancelOwnBooking(
      client.id,
      createdBooking.id,
    );

    const persistedBooking = await prisma.booking.findUniqueOrThrow({
      where: {
        id: createdBooking.id,
      },
      select: {
        status: true,
      },
    });
    const persistedTripOffer = await prisma.tripOffer.findUniqueOrThrow({
      where: {
        id: tripOffer.id,
      },
      select: {
        availableCapacity: true,
        capacityTotal: true,
        status: true,
      },
    });

    expect(cancelledBooking.status).toBe(BookingStatus.CANCELLED);
    expect(persistedBooking.status).toBe(BookingStatus.CANCELLED);
    expect(persistedTripOffer).toEqual({
      availableCapacity: 1,
      capacityTotal: 1,
      status: TripOfferStatus.PUBLISHED,
    });
  });

  it('expires stale pending bookings before a new reservation and never leaves availableCapacity negative', async () => {
    const now = new Date();
    const transporter = await createTransporter(prisma, 'expire-transporter');
    const staleClient = await createClient(prisma, 'expire-client-stale');
    const freshClient = await createClient(prisma, 'expire-client-fresh');
    const tripOffer = await createTripOffer(prisma, transporter.id, {
      capacityTotal: 1,
      availableCapacity: 0,
      status: TripOfferStatus.FULL,
    });

    const staleBooking = await prisma.booking.create({
      data: {
        tripOfferId: tripOffer.id,
        clientAccountId: staleClient.id,
        requestedUnits: 1,
        unitPriceSnapshot: 120000,
        totalPriceSnapshot: 120000,
        expiresAt: new Date(now.getTime() - 5 * 60 * 1000),
        status: BookingStatus.PENDING_PAYMENT,
      },
      select: {
        id: true,
      },
    });

    const freshBooking = await bookingService.createBooking(freshClient.id, {
      tripOfferId: tripOffer.id,
      requestedUnits: 1,
    });

    const persistedBookings = await prisma.booking.findMany({
      where: {
        tripOfferId: tripOffer.id,
      },
      select: {
        id: true,
        status: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    const persistedTripOffer = await prisma.tripOffer.findUniqueOrThrow({
      where: {
        id: tripOffer.id,
      },
      select: {
        availableCapacity: true,
        capacityTotal: true,
        status: true,
      },
    });

    expect(freshBooking.status).toBe(BookingStatus.PENDING_PAYMENT);
    expect(persistedBookings).toEqual([
      {
        id: staleBooking.id,
        status: BookingStatus.EXPIRED,
      },
      {
        id: freshBooking.id,
        status: BookingStatus.PENDING_PAYMENT,
      },
    ]);
    expect(persistedTripOffer).toEqual({
      availableCapacity: 0,
      capacityTotal: 1,
      status: TripOfferStatus.FULL,
    });
    expect(persistedTripOffer.availableCapacity).toBeGreaterThanOrEqual(0);
  });
});

async function cleanupDatabase(prisma: PrismaService): Promise<void> {
  await prisma.booking.deleteMany();
  await prisma.tripOffer.deleteMany();
  await prisma.transporterProfile.deleteMany();
  await prisma.account.deleteMany();
}

async function createTransporter(
  prisma: PrismaService,
  suffix: string,
): Promise<{ id: string }> {
  const account = await prisma.account.create({
    data: {
      email: `${suffix}-${Date.now()}@example.com`,
      passwordHash: 'hash',
      role: AccountRole.TRANSPORTER,
      transporterProfile: {
        create: {
          displayName: `Transporter ${suffix}`,
        },
      },
    },
    select: {
      transporterProfile: {
        select: {
          id: true,
        },
      },
    },
  });

  return account.transporterProfile!;
}

async function createClient(
  prisma: PrismaService,
  suffix: string,
): Promise<{ id: string }> {
  return prisma.account.create({
    data: {
      email: `${suffix}-${Date.now()}-${Math.random()}@example.com`,
      passwordHash: 'hash',
      role: AccountRole.CLIENT,
    },
    select: {
      id: true,
    },
  });
}

async function createTripOffer(
  prisma: PrismaService,
  transporterProfileId: string,
  input: {
    capacityTotal: number;
    availableCapacity: number;
    status: TripOfferStatus;
  },
): Promise<{ id: string }> {
  return prisma.tripOffer.create({
    data: {
      transporterProfileId,
      originLabel: 'Buenos Aires',
      originLat: new Prisma.Decimal('34.603722'),
      originLng: new Prisma.Decimal('-58.381592'),
      destinationLabel: 'Rosario',
      destinationLat: new Prisma.Decimal('-32.944242'),
      destinationLng: new Prisma.Decimal('-60.650539'),
      departureDate: new Date('2026-05-01T10:00:00.000Z'),
      capacityTotal: input.capacityTotal,
      availableCapacity: input.availableCapacity,
      pricePerSlot: 120000,
      status: input.status,
    },
    select: {
      id: true,
    },
  });
}
