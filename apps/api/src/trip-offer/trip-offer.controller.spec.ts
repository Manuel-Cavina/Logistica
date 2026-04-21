import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { JwtAuthGuard } from '../identity/authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/authentication/guards/roles.guard';
import { TripOfferService } from './application/trip-offer.service';
import { TripOfferController } from './trip-offer.controller';

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
      accountId: 'transporter-account-id',
      role,
    };

    return true;
  }
}

describe('TripOfferController', () => {
  const tripOfferService = {
    createOwnTripOffer: jest.fn(),
    updateOwnTripOffer: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  async function createApp() {
    const moduleBuilder = Test.createTestingModule({
      controllers: [TripOfferController],
      providers: [
        RolesGuard,
        {
          provide: TripOfferService,
          useValue: tripOfferService,
        },
      ],
    });

    moduleBuilder.overrideGuard(JwtAuthGuard).useClass(TestJwtAuthGuard);

    const moduleRef = await moduleBuilder.compile();
    const app = moduleRef.createNestApplication();
    await app.init();

    return app;
  }

  it('creates a trip offer draft for the authenticated transporter', async () => {
    const createdAt = '2026-04-21T10:00:00.000Z';
    const updatedAt = '2026-04-21T10:00:00.000Z';

    tripOfferService.createOwnTripOffer.mockResolvedValue({
      id: 'trip-offer-id',
      originLabel: 'Buenos Aires',
      originLat: -34.603722,
      originLng: -58.381592,
      destinationLabel: 'Rosario',
      destinationLat: -32.944243,
      destinationLng: -60.650539,
      departureDate: new Date('2026-05-01T00:00:00.000Z'),
      departureWindowStart: null,
      departureWindowEnd: null,
      capacityTotal: 6,
      availableCapacity: 6,
      pricePerSlot: 120000,
      maxDetourKm: 50,
      notes: 'Salida temprana',
      cancellationPolicy: 'Flexible',
      cargoType: 'EQUINE',
      isReturn: false,
      status: 'DRAFT',
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
    });

    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/trip-offers')
      .set('Authorization', 'Bearer TRANSPORTER')
      .send({
        originLabel: 'Buenos Aires',
        originLat: -34.603722,
        originLng: -58.381592,
        destinationLabel: 'Rosario',
        destinationLat: -32.944243,
        destinationLng: -60.650539,
        departureDate: '2026-05-01T00:00:00.000Z',
        capacityTotal: 6,
        availableCapacity: 3,
        pricePerSlot: 120000,
        maxDetourKm: 50,
        notes: 'Salida temprana',
        cancellationPolicy: 'Flexible',
        cargoType: 'EQUINE',
        isReturn: false,
      })
      .expect(201)
      .expect({
        id: 'trip-offer-id',
        originLabel: 'Buenos Aires',
        originLat: -34.603722,
        originLng: -58.381592,
        destinationLabel: 'Rosario',
        destinationLat: -32.944243,
        destinationLng: -60.650539,
        departureDate: '2026-05-01T00:00:00.000Z',
        departureWindowStart: null,
        departureWindowEnd: null,
        capacityTotal: 6,
        availableCapacity: 6,
        pricePerSlot: 120000,
        maxDetourKm: 50,
        notes: 'Salida temprana',
        cancellationPolicy: 'Flexible',
        cargoType: 'EQUINE',
        isReturn: false,
        status: 'DRAFT',
        createdAt,
        updatedAt,
      });

    expect(tripOfferService.createOwnTripOffer).toHaveBeenCalledWith(
      'transporter-account-id',
      expect.objectContaining({
        originLabel: 'Buenos Aires',
        capacityTotal: 6,
        availableCapacity: 3,
        departureDate: new Date('2026-05-01T00:00:00.000Z'),
      }),
    );

    await app.close();
  });

  it('returns 400 when the payload is invalid', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/trip-offers')
      .set('Authorization', 'Bearer TRANSPORTER')
      .send({
        originLabel: '',
        originLat: -120,
        originLng: -58.381592,
        destinationLabel: 'Rosario',
        destinationLat: -32.944243,
        destinationLng: -60.650539,
        departureDate: '2026-05-01T00:00:00.000Z',
        capacityTotal: 0,
        pricePerSlot: -1,
        cargoType: 'EQUINE',
        isReturn: false,
      })
      .expect(400);

    expect(tripOfferService.createOwnTripOffer).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 400 when trying to send forbidden ownership fields', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/trip-offers')
      .set('Authorization', 'Bearer TRANSPORTER')
      .send({
        originLabel: 'Buenos Aires',
        originLat: -34.603722,
        originLng: -58.381592,
        destinationLabel: 'Rosario',
        destinationLat: -32.944243,
        destinationLng: -60.650539,
        departureDate: '2026-05-01T00:00:00.000Z',
        capacityTotal: 6,
        pricePerSlot: 120000,
        cargoType: 'EQUINE',
        isReturn: false,
        transporterProfileId: 'other-profile-id',
      })
      .expect(400);

    expect(tripOfferService.createOwnTripOffer).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 401 when the access token is missing', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/trip-offers')
      .send({
        originLabel: 'Buenos Aires',
        originLat: -34.603722,
        originLng: -58.381592,
        destinationLabel: 'Rosario',
        destinationLat: -32.944243,
        destinationLng: -60.650539,
        departureDate: '2026-05-01T00:00:00.000Z',
        capacityTotal: 6,
        pricePerSlot: 120000,
        cargoType: 'EQUINE',
        isReturn: false,
      })
      .expect(401);

    await app.close();
  });

  it('returns 403 when the authenticated role is not TRANSPORTER', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/trip-offers')
      .set('Authorization', 'Bearer CLIENT')
      .send({
        originLabel: 'Buenos Aires',
        originLat: -34.603722,
        originLng: -58.381592,
        destinationLabel: 'Rosario',
        destinationLat: -32.944243,
        destinationLng: -60.650539,
        departureDate: '2026-05-01T00:00:00.000Z',
        capacityTotal: 6,
        pricePerSlot: 120000,
        cargoType: 'EQUINE',
        isReturn: false,
      })
      .expect(403);

    await app.close();
  });

  it('updates a draft trip offer when the id is valid', async () => {
    const updatedAt = '2026-04-21T12:00:00.000Z';
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const tripOfferId = 'cm9tripoffer0000wqz5oy7k8ph1';

    tripOfferService.updateOwnTripOffer.mockResolvedValue({
      id: tripOfferId,
      originLabel: 'Buenos Aires',
      originLat: -34.603722,
      originLng: -58.381592,
      destinationLabel: 'Cordoba',
      destinationLat: -31.420083,
      destinationLng: -64.188776,
      departureDate: null,
      departureWindowStart: new Date('2026-05-02T08:00:00.000Z'),
      departureWindowEnd: new Date('2026-05-02T12:00:00.000Z'),
      capacityTotal: 10,
      availableCapacity: 10,
      pricePerSlot: 140000,
      maxDetourKm: 70,
      notes: null,
      cancellationPolicy: 'Moderada',
      cargoType: 'GENERAL_CARGO',
      isReturn: true,
      status: 'DRAFT',
      createdAt: new Date('2026-04-21T10:00:00.000Z'),
      updatedAt: new Date(updatedAt),
    });

    await request(server)
      .patch(`/trip-offers/${tripOfferId}`)
      .set('Authorization', 'Bearer TRANSPORTER')
      .send({
        destinationLabel: 'Cordoba',
        destinationLat: -31.420083,
        destinationLng: -64.188776,
        departureDate: null,
        departureWindowStart: '2026-05-02T08:00:00.000Z',
        departureWindowEnd: '2026-05-02T12:00:00.000Z',
        capacityTotal: 10,
        availableCapacity: 2,
        pricePerSlot: 140000,
        maxDetourKm: 70,
        notes: null,
        cancellationPolicy: 'Moderada',
        cargoType: 'GENERAL_CARGO',
        isReturn: true,
      })
      .expect(200)
      .expect({
        id: tripOfferId,
        originLabel: 'Buenos Aires',
        originLat: -34.603722,
        originLng: -58.381592,
        destinationLabel: 'Cordoba',
        destinationLat: -31.420083,
        destinationLng: -64.188776,
        departureDate: null,
        departureWindowStart: '2026-05-02T08:00:00.000Z',
        departureWindowEnd: '2026-05-02T12:00:00.000Z',
        capacityTotal: 10,
        availableCapacity: 10,
        pricePerSlot: 140000,
        maxDetourKm: 70,
        notes: null,
        cancellationPolicy: 'Moderada',
        cargoType: 'GENERAL_CARGO',
        isReturn: true,
        status: 'DRAFT',
        createdAt: '2026-04-21T10:00:00.000Z',
        updatedAt,
      });

    expect(tripOfferService.updateOwnTripOffer).toHaveBeenCalledWith(
      'transporter-account-id',
      tripOfferId,
      expect.objectContaining({
        destinationLabel: 'Cordoba',
        capacityTotal: 10,
        availableCapacity: 2,
      }),
    );

    await app.close();
  });

  it('returns 404 when updating a trip offer that does not exist', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const tripOfferId = 'cm9tripoffer0000wqz5oy7k8ph1';

    tripOfferService.updateOwnTripOffer.mockRejectedValue(
      new NotFoundException('Trip offer not found.'),
    );

    await request(server)
      .patch(`/trip-offers/${tripOfferId}`)
      .set('Authorization', 'Bearer TRANSPORTER')
      .send({
        pricePerSlot: 140000,
      })
      .expect(404);

    await app.close();
  });

  it('returns 403 when updating a trip offer owned by another transporter', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const tripOfferId = 'cm9tripoffer0000wqz5oy7k8ph1';

    tripOfferService.updateOwnTripOffer.mockRejectedValue(
      new ForbiddenException(
        'You cannot edit a trip offer that belongs to another transporter.',
      ),
    );

    await request(server)
      .patch(`/trip-offers/${tripOfferId}`)
      .set('Authorization', 'Bearer TRANSPORTER')
      .send({
        pricePerSlot: 140000,
      })
      .expect(403);

    await app.close();
  });

  it('returns 409 when updating a trip offer outside draft status', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const tripOfferId = 'cm9tripoffer0000wqz5oy7k8ph1';

    tripOfferService.updateOwnTripOffer.mockRejectedValue(
      new ConflictException('Only trip offers in DRAFT status can be edited.'),
    );

    await request(server)
      .patch(`/trip-offers/${tripOfferId}`)
      .set('Authorization', 'Bearer TRANSPORTER')
      .send({
        pricePerSlot: 140000,
      })
      .expect(409);

    await app.close();
  });

  it('returns 400 when the temporal rule is invalid', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/trip-offers')
      .set('Authorization', 'Bearer TRANSPORTER')
      .send({
        originLabel: 'Buenos Aires',
        originLat: -34.603722,
        originLng: -58.381592,
        destinationLabel: 'Rosario',
        destinationLat: -32.944243,
        destinationLng: -60.650539,
        departureDate: '2026-05-01T00:00:00.000Z',
        departureWindowStart: '2026-05-01T08:00:00.000Z',
        departureWindowEnd: '2026-05-01T12:00:00.000Z',
        capacityTotal: 6,
        pricePerSlot: 120000,
        cargoType: 'EQUINE',
        isReturn: false,
      })
      .expect(400);

    expect(tripOfferService.createOwnTripOffer).not.toHaveBeenCalled();

    await app.close();
  });
});
