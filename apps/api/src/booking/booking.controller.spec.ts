import {
  ConflictException,
  Injectable,
  NotFoundException,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { JwtAuthGuard } from '../identity/authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/authentication/guards/roles.guard';
import { BookingService } from './application/booking.service';
import { BOOKING_INSUFFICIENT_CAPACITY_MESSAGE } from './application/booking.errors';
import { BookingController } from './booking.controller';

@Injectable()
class TestJwtAuthGuard {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      user?: { accountId: string; role: 'CLIENT' | 'TRANSPORTER' | 'ADMIN' };
    }>();
    const authorizationHeader = request.headers.authorization;

    if (typeof authorizationHeader !== 'string') {
      throw new UnauthorizedException();
    }

    const [, role] = authorizationHeader.split(' ');

    if (role !== 'CLIENT' && role !== 'TRANSPORTER' && role !== 'ADMIN') {
      throw new UnauthorizedException();
    }

    request.user = {
      accountId: 'client-account-id',
      role,
    };

    return true;
  }
}

describe('BookingController', () => {
  const bookingService = {
    createBooking: jest.fn(),
    getOwnBookingById: jest.fn(),
    cancelOwnBooking: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  async function createApp() {
    const moduleBuilder = Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        RolesGuard,
        {
          provide: BookingService,
          useValue: bookingService,
        },
      ],
    });

    moduleBuilder.overrideGuard(JwtAuthGuard).useClass(TestJwtAuthGuard);

    const moduleRef = await moduleBuilder.compile();
    const app = moduleRef.createNestApplication();
    await app.init();

    return app;
  }

  it('creates a booking for the authenticated client', async () => {
    bookingService.createBooking.mockResolvedValue({
      id: 'cmabooking0000wqz5oy7k8ph1',
      tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
      clientAccountId: 'client-account-id',
      requestedUnits: 2,
      unitPriceSnapshot: 120000,
      totalPriceSnapshot: 240000,
      expiresAt: new Date('2026-04-24T13:30:00.000Z'),
      status: 'PENDING_PAYMENT',
      createdAt: new Date('2026-04-24T13:00:00.000Z'),
      updatedAt: new Date('2026-04-24T13:00:00.000Z'),
    });

    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/bookings')
      .set('Authorization', 'Bearer CLIENT')
      .send({
        tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
        requestedUnits: 2,
      })
      .expect(201)
      .expect({
        id: 'cmabooking0000wqz5oy7k8ph1',
        tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
        clientAccountId: 'client-account-id',
        requestedUnits: 2,
        unitPriceSnapshot: 120000,
        totalPriceSnapshot: 240000,
        expiresAt: '2026-04-24T13:30:00.000Z',
        status: 'PENDING_PAYMENT',
        createdAt: '2026-04-24T13:00:00.000Z',
        updatedAt: '2026-04-24T13:00:00.000Z',
      });

    expect(bookingService.createBooking).toHaveBeenCalledWith(
      'client-account-id',
      {
        tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
        requestedUnits: 2,
      },
    );

    await app.close();
  });

  it('returns the requested booking detail for the authenticated client', async () => {
    bookingService.getOwnBookingById.mockResolvedValue({
      id: 'cmabooking0000wqz5oy7k8ph1',
      tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
      requestedUnits: 2,
      unitPriceSnapshot: 120000,
      totalPriceSnapshot: 240000,
      expiresAt: new Date('2026-04-24T13:30:00.000Z'),
      status: 'PENDING_PAYMENT',
      createdAt: new Date('2026-04-24T13:00:00.000Z'),
      updatedAt: new Date('2026-04-24T13:00:00.000Z'),
      tripOffer: {
        id: 'cmatripoffer0000wqz5oy7k8ph1',
        originLabel: 'Buenos Aires',
        destinationLabel: 'Rosario',
        departureDate: new Date('2026-04-25T10:00:00.000Z'),
        departureWindowStart: null,
        departureWindowEnd: null,
        status: 'PUBLISHED',
      },
    });

    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .get('/bookings/cmabooking0000wqz5oy7k8ph1')
      .set('Authorization', 'Bearer CLIENT')
      .expect(200)
      .expect({
        id: 'cmabooking0000wqz5oy7k8ph1',
        tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
        requestedUnits: 2,
        unitPriceSnapshot: 120000,
        totalPriceSnapshot: 240000,
        expiresAt: '2026-04-24T13:30:00.000Z',
        status: 'PENDING_PAYMENT',
        createdAt: '2026-04-24T13:00:00.000Z',
        updatedAt: '2026-04-24T13:00:00.000Z',
        tripOffer: {
          id: 'cmatripoffer0000wqz5oy7k8ph1',
          originLabel: 'Buenos Aires',
          destinationLabel: 'Rosario',
          departureDate: '2026-04-25T10:00:00.000Z',
          departureWindowStart: null,
          departureWindowEnd: null,
          status: 'PUBLISHED',
        },
      });

    expect(bookingService.getOwnBookingById).toHaveBeenCalledWith(
      'client-account-id',
      'cmabooking0000wqz5oy7k8ph1',
    );

    await app.close();
  });

  it('returns 400 when tripOfferId is invalid', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/bookings')
      .set('Authorization', 'Bearer CLIENT')
      .send({
        tripOfferId: 'not-a-cuid',
        requestedUnits: 2,
      })
      .expect(400);

    expect(bookingService.createBooking).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 400 when booking id is invalid', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .get('/bookings/not-a-cuid')
      .set('Authorization', 'Bearer CLIENT')
      .expect(400);

    expect(bookingService.getOwnBookingById).not.toHaveBeenCalled();

    await app.close();
  });

  it('cancels a booking for the authenticated client', async () => {
    bookingService.cancelOwnBooking.mockResolvedValue({
      id: 'cmabooking0000wqz5oy7k8ph1',
      tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
      clientAccountId: 'client-account-id',
      requestedUnits: 2,
      unitPriceSnapshot: 120000,
      totalPriceSnapshot: 240000,
      expiresAt: new Date('2026-04-24T13:30:00.000Z'),
      status: 'CANCELLED',
      createdAt: new Date('2026-04-24T13:00:00.000Z'),
      updatedAt: new Date('2026-04-24T13:05:00.000Z'),
    });

    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/bookings/cmabooking0000wqz5oy7k8ph1/cancel')
      .set('Authorization', 'Bearer CLIENT')
      .expect(201)
      .expect({
        id: 'cmabooking0000wqz5oy7k8ph1',
        tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
        clientAccountId: 'client-account-id',
        requestedUnits: 2,
        unitPriceSnapshot: 120000,
        totalPriceSnapshot: 240000,
        expiresAt: '2026-04-24T13:30:00.000Z',
        status: 'CANCELLED',
        createdAt: '2026-04-24T13:00:00.000Z',
        updatedAt: '2026-04-24T13:05:00.000Z',
      });

    expect(bookingService.cancelOwnBooking).toHaveBeenCalledWith(
      'client-account-id',
      'cmabooking0000wqz5oy7k8ph1',
    );

    await app.close();
  });

  it('returns 400 when requestedUnits is zero', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/bookings')
      .set('Authorization', 'Bearer CLIENT')
      .send({
        tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
        requestedUnits: 0,
      })
      .expect(400);

    expect(bookingService.createBooking).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 400 when requestedUnits is negative', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/bookings')
      .set('Authorization', 'Bearer CLIENT')
      .send({
        tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
        requestedUnits: -1,
      })
      .expect(400);

    expect(bookingService.createBooking).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 400 when requestedUnits is not an integer', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/bookings')
      .set('Authorization', 'Bearer CLIENT')
      .send({
        tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
        requestedUnits: 1.5,
      })
      .expect(400);

    expect(bookingService.createBooking).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 401 when the access token is missing', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/bookings')
      .send({
        tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
        requestedUnits: 2,
      })
      .expect(401);

    await app.close();
  });

  it('returns 401 when reading a booking without an access token', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .get('/bookings/cmabooking0000wqz5oy7k8ph1')
      .expect(401);

    await app.close();
  });

  it('returns 401 when cancelling a booking without an access token', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/bookings/cmabooking0000wqz5oy7k8ph1/cancel')
      .expect(401);

    await app.close();
  });

  it('returns 403 when the authenticated role is not CLIENT', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/bookings')
      .set('Authorization', 'Bearer TRANSPORTER')
      .send({
        tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
        requestedUnits: 2,
      })
      .expect(403);

    await app.close();
  });

  it('returns 403 when reading a booking with a non-client role', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .get('/bookings/cmabooking0000wqz5oy7k8ph1')
      .set('Authorization', 'Bearer TRANSPORTER')
      .expect(403);

    await app.close();
  });

  it('returns 403 when cancelling a booking with a non-client role', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/bookings/cmabooking0000wqz5oy7k8ph1/cancel')
      .set('Authorization', 'Bearer TRANSPORTER')
      .expect(403);

    await app.close();
  });

  it('returns 404 when the trip offer does not exist', async () => {
    bookingService.createBooking.mockRejectedValue(
      new NotFoundException('Trip offer not found.'),
    );

    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/bookings')
      .set('Authorization', 'Bearer CLIENT')
      .send({
        tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
        requestedUnits: 2,
      })
      .expect(404);

    await app.close();
  });

  it('returns 404 when the booking does not exist or is not accessible', async () => {
    bookingService.getOwnBookingById.mockRejectedValue(
      new NotFoundException('Booking not found for the authenticated account.'),
    );

    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .get('/bookings/cmabooking0000wqz5oy7k8ph1')
      .set('Authorization', 'Bearer CLIENT')
      .expect(404)
      .expect({
        error: 'Not Found',
        message: 'Booking not found for the authenticated account.',
        statusCode: 404,
      });

    await app.close();
  });

  it('returns 404 when the booking to cancel does not exist or is not accessible', async () => {
    bookingService.cancelOwnBooking.mockRejectedValue(
      new NotFoundException('Booking not found for the authenticated account.'),
    );

    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/bookings/cmabooking0000wqz5oy7k8ph1/cancel')
      .set('Authorization', 'Bearer CLIENT')
      .expect(404)
      .expect({
        error: 'Not Found',
        message: 'Booking not found for the authenticated account.',
        statusCode: 404,
      });

    await app.close();
  });

  it('returns 409 when the trip offer is not published', async () => {
    bookingService.createBooking.mockRejectedValue(
      new ConflictException(
        'Bookings can only be created for trip offers in PUBLISHED status.',
      ),
    );

    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/bookings')
      .set('Authorization', 'Bearer CLIENT')
      .send({
        tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
        requestedUnits: 2,
      })
      .expect(409);

    await app.close();
  });

  it('returns 409 when the requested units exceed available capacity', async () => {
    bookingService.createBooking.mockRejectedValue(
      new ConflictException(BOOKING_INSUFFICIENT_CAPACITY_MESSAGE),
    );

    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/bookings')
      .set('Authorization', 'Bearer CLIENT')
      .send({
        tripOfferId: 'cmatripoffer0000wqz5oy7k8ph1',
        requestedUnits: 2,
      })
      .expect(409)
      .expect({
        error: 'Conflict',
        message: BOOKING_INSUFFICIENT_CAPACITY_MESSAGE,
        statusCode: 409,
      });

    await app.close();
  });

  it('returns 409 when the booking cannot be cancelled', async () => {
    bookingService.cancelOwnBooking.mockRejectedValue(
      new ConflictException(
        'Only bookings in PENDING_PAYMENT status can be cancelled.',
      ),
    );

    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/bookings/cmabooking0000wqz5oy7k8ph1/cancel')
      .set('Authorization', 'Bearer CLIENT')
      .expect(409)
      .expect({
        error: 'Conflict',
        message: 'Only bookings in PENDING_PAYMENT status can be cancelled.',
        statusCode: 409,
      });

    await app.close();
  });
});
