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
});
