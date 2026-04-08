import {
  Injectable,
  type ExecutionContext,
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
    createOwnTrailer: jest.fn(),
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
});
