import {
  Injectable,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { JwtAuthGuard } from '../identity/authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/authentication/guards/roles.guard';
import { VehicleService } from './application/vehicle.service';
import { VehicleController } from './vehicle.controller';

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

describe('VehicleController', () => {
  const vehicleService = {
    createOwnVehicle: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  async function createApp() {
    const moduleBuilder = Test.createTestingModule({
      controllers: [VehicleController],
      providers: [
        RolesGuard,
        {
          provide: VehicleService,
          useValue: vehicleService,
        },
      ],
    });

    moduleBuilder.overrideGuard(JwtAuthGuard).useClass(TestJwtAuthGuard);

    const moduleRef = await moduleBuilder.compile();
    const app = moduleRef.createNestApplication();
    await app.init();

    return app;
  }

  it('creates a vehicle for a transporter token', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    vehicleService.createOwnVehicle.mockResolvedValue({
      id: 'vehicle-id',
      licensePlate: 'AB123CD',
      brand: 'Scania',
      model: 'R450',
      isActive: true,
    });

    await request(server)
      .post('/vehicles')
      .set('Authorization', 'Bearer TRANSPORTER')
      .send({
        licensePlate: 'ab123cd',
        brand: 'Scania',
        model: 'R450',
      })
      .expect(201)
      .expect({
        id: 'vehicle-id',
        licensePlate: 'AB123CD',
        brand: 'Scania',
        model: 'R450',
        isActive: true,
      });

    expect(vehicleService.createOwnVehicle).toHaveBeenCalledWith(
      'transporter-account-id',
      {
        licensePlate: 'AB123CD',
        brand: 'Scania',
        model: 'R450',
      },
    );

    await app.close();
  });

  it('returns 400 when the payload is invalid', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/vehicles')
      .set('Authorization', 'Bearer TRANSPORTER')
      .send({
        licensePlate: '12',
        brand: '',
        model: 'R450',
      })
      .expect(400);

    expect(vehicleService.createOwnVehicle).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 401 when the access token is missing', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/vehicles')
      .send({
        licensePlate: 'AB123CD',
        brand: 'Scania',
        model: 'R450',
      })
      .expect(401);

    expect(vehicleService.createOwnVehicle).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 403 when the authenticated role is not TRANSPORTER', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/vehicles')
      .set('Authorization', 'Bearer CLIENT')
      .send({
        licensePlate: 'AB123CD',
        brand: 'Scania',
        model: 'R450',
      })
      .expect(403);

    expect(vehicleService.createOwnVehicle).not.toHaveBeenCalled();

    await app.close();
  });
});
