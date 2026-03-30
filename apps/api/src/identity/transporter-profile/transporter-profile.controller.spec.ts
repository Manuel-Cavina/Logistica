import {
  Injectable,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { TransporterProfileService } from './application/transporter-profile.service';
import { TransporterProfileController } from './transporter-profile.controller';

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

    if (
      role !== 'CLIENT' &&
      role !== 'TRANSPORTER' &&
      role !== 'ADMIN'
    ) {
      throw new UnauthorizedException();
    }

    request.user = {
      accountId: 'transporter-account-id',
      role,
    };

    return true;
  }
}

describe('TransporterProfileController', () => {
  const transporterProfileService = {
    getOwnProfile: jest.fn(),
    updateOwnProfile: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  async function createApp() {
    const moduleBuilder = Test.createTestingModule({
      controllers: [TransporterProfileController],
      providers: [
        RolesGuard,
        {
          provide: TransporterProfileService,
          useValue: transporterProfileService,
        },
      ],
    });

    moduleBuilder.overrideGuard(JwtAuthGuard).useClass(TestJwtAuthGuard);

    const moduleRef = await moduleBuilder.compile();
    const app = moduleRef.createNestApplication();
    await app.init();

    return app;
  }

  it('returns the authenticated transporter profile for a transporter token', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    transporterProfileService.getOwnProfile.mockResolvedValue({
      displayName: 'Acme Transportes',
      businessName: 'Acme Transportes SA',
      contactPhone: '+54 9 11 1234 5678',
      bio: 'Traslados de equinos.',
      maxDetourKmDefault: 120,
      verificationStatus: 'PENDING',
    });

    await request(server)
      .get('/transporter/profile')
      .set('Authorization', 'Bearer TRANSPORTER')
      .expect(200)
      .expect({
        displayName: 'Acme Transportes',
        businessName: 'Acme Transportes SA',
        contactPhone: '+54 9 11 1234 5678',
        bio: 'Traslados de equinos.',
        maxDetourKmDefault: 120,
        verificationStatus: 'PENDING',
      });

    expect(transporterProfileService.getOwnProfile).toHaveBeenCalledWith(
      'transporter-account-id',
    );

    await app.close();
  });

  it('returns 401 when the access token is missing', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server).get('/transporter/profile').expect(401);

    expect(transporterProfileService.getOwnProfile).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 403 when the authenticated role is not TRANSPORTER', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .get('/transporter/profile')
      .set('Authorization', 'Bearer CLIENT')
      .expect(403);

    expect(transporterProfileService.getOwnProfile).not.toHaveBeenCalled();

    await app.close();
  });

  it('updates the authenticated transporter profile for a transporter token', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    transporterProfileService.updateOwnProfile.mockResolvedValue({
      displayName: 'Acme Transportes',
      businessName: 'Acme Transportes SA',
      contactPhone: '+54 9 11 1234 5678',
      bio: 'Traslados de equinos.',
      maxDetourKmDefault: 120,
      verificationStatus: 'PENDING',
    });

    await request(server)
      .patch('/transporter/profile')
      .set('Authorization', 'Bearer TRANSPORTER')
      .send({
        businessName: 'Acme Transportes SA',
        bio: 'Traslados de equinos.',
        maxDetourKmDefault: 120,
      })
      .expect(200)
      .expect({
        displayName: 'Acme Transportes',
        businessName: 'Acme Transportes SA',
        contactPhone: '+54 9 11 1234 5678',
        bio: 'Traslados de equinos.',
        maxDetourKmDefault: 120,
        verificationStatus: 'PENDING',
      });

    expect(transporterProfileService.updateOwnProfile).toHaveBeenCalledWith(
      'transporter-account-id',
      {
        businessName: 'Acme Transportes SA',
        bio: 'Traslados de equinos.',
        maxDetourKmDefault: 120,
      },
    );

    await app.close();
  });

  it('returns 400 on patch when the payload is empty', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .patch('/transporter/profile')
      .set('Authorization', 'Bearer TRANSPORTER')
      .send({})
      .expect(400);

    expect(transporterProfileService.updateOwnProfile).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 400 on patch when the payload includes forbidden fields', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .patch('/transporter/profile')
      .set('Authorization', 'Bearer TRANSPORTER')
      .send({
        displayName: 'Acme Transportes',
        verificationStatus: 'VERIFIED',
      })
      .expect(400);

    expect(transporterProfileService.updateOwnProfile).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 401 on patch when the access token is missing', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .patch('/transporter/profile')
      .send({ bio: 'Traslados de equinos.' })
      .expect(401);

    expect(transporterProfileService.updateOwnProfile).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 403 on patch when the authenticated role is not TRANSPORTER', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .patch('/transporter/profile')
      .set('Authorization', 'Bearer CLIENT')
      .send({ bio: 'Traslados de equinos.' })
      .expect(403);

    expect(transporterProfileService.updateOwnProfile).not.toHaveBeenCalled();

    await app.close();
  });
});
