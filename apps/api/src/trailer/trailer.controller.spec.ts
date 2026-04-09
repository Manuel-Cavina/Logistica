import {
  Injectable,
  type ExecutionContext,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { JwtAuthGuard } from '../identity/authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/authentication/guards/roles.guard';
import { TrailerService } from './application/trailer.service';
import { TrailerController } from './trailer.controller';

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

describe('TrailerController', () => {
  const trailerService = {
    listOwnTrailers: jest.fn(),
    createOwnTrailer: jest.fn(),
    updateOwnTrailer: jest.fn(),
    deactivateOwnTrailer: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  async function createApp() {
    const moduleBuilder = Test.createTestingModule({
      controllers: [TrailerController],
      providers: [
        RolesGuard,
        {
          provide: TrailerService,
          useValue: trailerService,
        },
      ],
    });

    moduleBuilder.overrideGuard(JwtAuthGuard).useClass(TestJwtAuthGuard);

    const moduleRef = await moduleBuilder.compile();
    const app = moduleRef.createNestApplication();
    await app.init();

    return app;
  }

  it('lists the authenticated transporter trailers', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    trailerService.listOwnTrailers.mockResolvedValue([
      {
        id: 'trailer-active-id',
        totalCapacity: 12,
        cargoType: 'EQUINE',
        capacityUnit: 'SLOT',
        isActive: true,
      },
      {
        id: 'trailer-inactive-id',
        totalCapacity: 16,
        cargoType: 'GENERAL_CARGO',
        capacityUnit: 'KG',
        isActive: false,
      },
    ]);

    await request(server)
      .get('/trailers')
      .set('Authorization', 'Bearer TRANSPORTER')
      .expect(200)
      .expect([
        {
          id: 'trailer-active-id',
          totalCapacity: 12,
          cargoType: 'EQUINE',
          capacityUnit: 'SLOT',
          isActive: true,
        },
        {
          id: 'trailer-inactive-id',
          totalCapacity: 16,
          cargoType: 'GENERAL_CARGO',
          capacityUnit: 'KG',
          isActive: false,
        },
      ]);

    expect(trailerService.listOwnTrailers).toHaveBeenCalledWith(
      'transporter-account-id',
    );

    await app.close();
  });

  it('creates a trailer for a transporter token', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    trailerService.createOwnTrailer.mockResolvedValue({
      id: 'trailer-id',
      totalCapacity: 12,
      cargoType: 'EQUINE',
      capacityUnit: 'SLOT',
      isActive: true,
    });

    await request(server)
      .post('/trailers')
      .set('Authorization', 'Bearer TRANSPORTER')
      .send({
        totalCapacity: 12,
        cargoType: 'EQUINE',
        capacityUnit: 'SLOT',
      })
      .expect(201)
      .expect({
        id: 'trailer-id',
        totalCapacity: 12,
        cargoType: 'EQUINE',
        capacityUnit: 'SLOT',
        isActive: true,
      });

    expect(trailerService.createOwnTrailer).toHaveBeenCalledWith(
      'transporter-account-id',
      {
        totalCapacity: 12,
        cargoType: 'EQUINE',
        capacityUnit: 'SLOT',
      },
    );

    await app.close();
  });

  it('returns 400 when the payload is invalid', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/trailers')
      .set('Authorization', 'Bearer TRANSPORTER')
      .send({
        totalCapacity: 0,
        cargoType: 'EQUINE',
        capacityUnit: 'SLOT',
      })
      .expect(400);

    expect(trailerService.createOwnTrailer).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 401 when the access token is missing', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/trailers')
      .send({
        totalCapacity: 12,
        cargoType: 'EQUINE',
        capacityUnit: 'SLOT',
      })
      .expect(401);

    expect(trailerService.createOwnTrailer).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 403 when the authenticated role is not TRANSPORTER', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/trailers')
      .set('Authorization', 'Bearer CLIENT')
      .send({
        totalCapacity: 12,
        cargoType: 'EQUINE',
        capacityUnit: 'SLOT',
      })
      .expect(403);

    expect(trailerService.createOwnTrailer).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 400 when updating with an invalid trailer id', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .patch('/trailers/trailer-id')
      .set('Authorization', 'Bearer TRANSPORTER')
      .send({
        totalCapacity: 16,
      })
      .expect(400);

    expect(trailerService.updateOwnTrailer).not.toHaveBeenCalled();

    await app.close();
  });

  it('updates an owned trailer when the id is valid', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const trailerId = 'cm9trailer0000wqz5oy7k8ph1';

    trailerService.updateOwnTrailer.mockResolvedValue({
      id: trailerId,
      totalCapacity: 16,
      cargoType: 'GENERAL_CARGO',
      capacityUnit: 'KG',
      isActive: true,
    });

    await request(server)
      .patch(`/trailers/${trailerId}`)
      .set('Authorization', 'Bearer TRANSPORTER')
      .send({
        totalCapacity: 16,
        cargoType: 'GENERAL_CARGO',
        capacityUnit: 'KG',
      })
      .expect(200)
      .expect({
        id: trailerId,
        totalCapacity: 16,
        cargoType: 'GENERAL_CARGO',
        capacityUnit: 'KG',
        isActive: true,
      });

    expect(trailerService.updateOwnTrailer).toHaveBeenCalledWith(
      'transporter-account-id',
      trailerId,
      {
        totalCapacity: 16,
        cargoType: 'GENERAL_CARGO',
        capacityUnit: 'KG',
      },
    );

    await app.close();
  });

  it('returns 404 when updating a trailer that is not owned by the account', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const trailerId = 'cm9trailer0000wqz5oy7k8ph1';

    trailerService.updateOwnTrailer.mockRejectedValue(
      new NotFoundException('Trailer not found for the authenticated account.'),
    );

    await request(server)
      .patch(`/trailers/${trailerId}`)
      .set('Authorization', 'Bearer TRANSPORTER')
      .send({
        totalCapacity: 16,
      })
      .expect(404);

    await app.close();
  });

  it('deactivates an owned trailer for a transporter token', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const trailerId = 'cm9trailer0000wqz5oy7k8ph1';

    trailerService.deactivateOwnTrailer.mockResolvedValue({
      id: trailerId,
      totalCapacity: 12,
      cargoType: 'EQUINE',
      capacityUnit: 'SLOT',
      isActive: false,
    });

    await request(server)
      .patch(`/trailers/${trailerId}/deactivate`)
      .set('Authorization', 'Bearer TRANSPORTER')
      .expect(200)
      .expect({
        id: trailerId,
        totalCapacity: 12,
        cargoType: 'EQUINE',
        capacityUnit: 'SLOT',
        isActive: false,
      });

    expect(trailerService.deactivateOwnTrailer).toHaveBeenCalledWith(
      'transporter-account-id',
      trailerId,
    );

    await app.close();
  });

  it('returns 404 when deactivating a trailer that is not owned by the account', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const trailerId = 'cm9trailer0000wqz5oy7k8ph1';

    trailerService.deactivateOwnTrailer.mockRejectedValue(
      new NotFoundException('Trailer not found for the authenticated account.'),
    );

    await request(server)
      .patch(`/trailers/${trailerId}/deactivate`)
      .set('Authorization', 'Bearer TRANSPORTER')
      .expect(404);

    await app.close();
  });
});
