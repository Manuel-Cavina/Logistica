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
import { AdminService } from './application/admin.service';
import { AdminController } from './admin.controller';

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
      accountId: 'admin-account-id',
      role,
    };

    return true;
  }
}

describe('AdminController', () => {
  const adminService = {
    listTransporters: jest.fn(),
    getTransporterDetail: jest.fn(),
    updateTransporterVerificationStatus: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  async function createApp() {
    const moduleBuilder = Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        RolesGuard,
        {
          provide: AdminService,
          useValue: adminService,
        },
      ],
    });

    moduleBuilder.overrideGuard(JwtAuthGuard).useClass(TestJwtAuthGuard);

    const moduleRef = await moduleBuilder.compile();
    const app = moduleRef.createNestApplication();
    await app.init();

    return app;
  }

  it('returns the transporter list for an admin token', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    adminService.listTransporters.mockResolvedValue([
      {
        id: 'transporter-profile-id',
        displayName: 'Acme Transportes',
        contactPhone: '+54 9 11 1234 5678',
        verificationStatus: 'PENDING',
      },
    ]);

    await request(server)
      .get('/admin/transporters')
      .set('Authorization', 'Bearer ADMIN')
      .expect(200)
      .expect([
        {
          id: 'transporter-profile-id',
          displayName: 'Acme Transportes',
          contactPhone: '+54 9 11 1234 5678',
          verificationStatus: 'PENDING',
        },
      ]);

    expect(adminService.listTransporters).toHaveBeenCalledWith({});

    await app.close();
  });

  it('passes the verification status filter to the service', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    adminService.listTransporters.mockResolvedValue([]);

    await request(server)
      .get('/admin/transporters?status=VERIFIED')
      .set('Authorization', 'Bearer ADMIN')
      .expect(200)
      .expect([]);

    expect(adminService.listTransporters).toHaveBeenCalledWith({
      status: 'VERIFIED',
    });

    await app.close();
  });

  it('returns 400 when the transporter status filter is invalid', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .get('/admin/transporters?status=INVALID')
      .set('Authorization', 'Bearer ADMIN')
      .expect(400);

    expect(adminService.listTransporters).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 401 when the admin list token is missing', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server).get('/admin/transporters').expect(401);

    expect(adminService.listTransporters).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 403 when the authenticated role is not ADMIN in the list endpoint', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .get('/admin/transporters')
      .set('Authorization', 'Bearer TRANSPORTER')
      .expect(403);

    expect(adminService.listTransporters).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns the transporter detail for an admin token', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    adminService.getTransporterDetail.mockResolvedValue({
      id: 'cm8w8x2p70000wqz5oy7k8ph1',
      displayName: 'Acme Transportes',
      businessName: 'Acme Transportes SA',
      contactPhone: '+54 9 11 1234 5678',
      bio: 'Traslados de equinos.',
      maxDetourKmDefault: 120,
      verificationStatus: 'VERIFIED',
    });

    await request(server)
      .get('/admin/transporters/cm8w8x2p70000wqz5oy7k8ph1')
      .set('Authorization', 'Bearer ADMIN')
      .expect(200)
      .expect({
        id: 'cm8w8x2p70000wqz5oy7k8ph1',
        displayName: 'Acme Transportes',
        businessName: 'Acme Transportes SA',
        contactPhone: '+54 9 11 1234 5678',
        bio: 'Traslados de equinos.',
        maxDetourKmDefault: 120,
        verificationStatus: 'VERIFIED',
      });

    expect(adminService.getTransporterDetail).toHaveBeenCalledWith(
      'cm8w8x2p70000wqz5oy7k8ph1',
    );

    await app.close();
  });

  it('returns 400 when the transporter id is invalid', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .get('/admin/transporters/not-a-cuid')
      .set('Authorization', 'Bearer ADMIN')
      .expect(400);

    expect(adminService.getTransporterDetail).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 404 when the transporter profile does not exist', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    adminService.getTransporterDetail.mockRejectedValue(
      new NotFoundException('Transporter profile not found.'),
    );

    await request(server)
      .get('/admin/transporters/cm8w8x2p70000wqz5oy7k8ph1')
      .set('Authorization', 'Bearer ADMIN')
      .expect(404);

    await app.close();
  });

  it('updates the transporter verification status for an admin token', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    adminService.updateTransporterVerificationStatus.mockResolvedValue({
      id: 'cm8w8x2p70000wqz5oy7k8ph1',
      displayName: 'Acme Transportes',
      businessName: 'Acme Transportes SA',
      contactPhone: '+54 9 11 1234 5678',
      bio: 'Traslados de equinos.',
      maxDetourKmDefault: 120,
      verificationStatus: 'VERIFIED',
    });

    await request(server)
      .patch(
        '/admin/transporters/cm8w8x2p70000wqz5oy7k8ph1/verification-status',
      )
      .set('Authorization', 'Bearer ADMIN')
      .send({
        verificationStatus: 'VERIFIED',
      })
      .expect(200)
      .expect({
        id: 'cm8w8x2p70000wqz5oy7k8ph1',
        displayName: 'Acme Transportes',
        businessName: 'Acme Transportes SA',
        contactPhone: '+54 9 11 1234 5678',
        bio: 'Traslados de equinos.',
        maxDetourKmDefault: 120,
        verificationStatus: 'VERIFIED',
      });

    expect(
      adminService.updateTransporterVerificationStatus,
    ).toHaveBeenCalledWith('cm8w8x2p70000wqz5oy7k8ph1', {
      verificationStatus: 'VERIFIED',
    });

    await app.close();
  });

  it('returns 400 when the verification status payload is invalid', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .patch(
        '/admin/transporters/cm8w8x2p70000wqz5oy7k8ph1/verification-status',
      )
      .set('Authorization', 'Bearer ADMIN')
      .send({
        verificationStatus: 'PENDING',
      })
      .expect(400);

    expect(
      adminService.updateTransporterVerificationStatus,
    ).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 400 when the transporter id is invalid in the update endpoint', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .patch('/admin/transporters/not-a-cuid/verification-status')
      .set('Authorization', 'Bearer ADMIN')
      .send({
        verificationStatus: 'VERIFIED',
      })
      .expect(400);

    expect(
      adminService.updateTransporterVerificationStatus,
    ).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 400 when the verification status payload contains extra fields', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .patch(
        '/admin/transporters/cm8w8x2p70000wqz5oy7k8ph1/verification-status',
      )
      .set('Authorization', 'Bearer ADMIN')
      .send({
        verificationStatus: 'VERIFIED',
        reason: 'approved',
      })
      .expect(400);

    expect(
      adminService.updateTransporterVerificationStatus,
    ).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 401 when the admin update token is missing', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .patch(
        '/admin/transporters/cm8w8x2p70000wqz5oy7k8ph1/verification-status',
      )
      .send({
        verificationStatus: 'VERIFIED',
      })
      .expect(401);

    expect(
      adminService.updateTransporterVerificationStatus,
    ).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 403 when the authenticated role is not ADMIN in the update endpoint', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .patch(
        '/admin/transporters/cm8w8x2p70000wqz5oy7k8ph1/verification-status',
      )
      .set('Authorization', 'Bearer TRANSPORTER')
      .send({
        verificationStatus: 'VERIFIED',
      })
      .expect(403);

    expect(
      adminService.updateTransporterVerificationStatus,
    ).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 404 when updating the verification status of a missing transporter profile', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    adminService.updateTransporterVerificationStatus.mockRejectedValue(
      new NotFoundException('Transporter profile not found.'),
    );

    await request(server)
      .patch(
        '/admin/transporters/cm8w8x2p70000wqz5oy7k8ph1/verification-status',
      )
      .set('Authorization', 'Bearer ADMIN')
      .send({
        verificationStatus: 'VERIFIED',
      })
      .expect(404);

    await app.close();
  });

  it('returns 409 when the verification status transition is invalid', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    adminService.updateTransporterVerificationStatus.mockRejectedValue(
      new ConflictException(
        'Invalid transporter verification transition from VERIFIED to REJECTED.',
      ),
    );

    await request(server)
      .patch(
        '/admin/transporters/cm8w8x2p70000wqz5oy7k8ph1/verification-status',
      )
      .set('Authorization', 'Bearer ADMIN')
      .send({
        verificationStatus: 'REJECTED',
      })
      .expect(409);

    await app.close();
  });
});
