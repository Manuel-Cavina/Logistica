import {
  Controller,
  Get,
  Injectable,
  type ExecutionContext,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { Roles } from '../decorators/roles.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

@Controller('role-tests')
class RoleTestController {
  @Get('client-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT')
  clientOnly(): { ok: true } {
    return { ok: true };
  }

  @Get('client-or-transporter')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CLIENT', 'TRANSPORTER')
  clientOrTransporter(): { ok: true } {
    return { ok: true };
  }

  @Get('authenticated')
  @UseGuards(JwtAuthGuard, RolesGuard)
  authenticatedOnly(): { ok: true } {
    return { ok: true };
  }
}

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
      accountId: 'account-id',
      role,
    };

    return true;
  }
}

describe('RolesGuard integration', () => {
  async function createApp() {
    const moduleBuilder = Test.createTestingModule({
      controllers: [RoleTestController],
      providers: [RolesGuard],
    });

    moduleBuilder.overrideGuard(JwtAuthGuard).useClass(TestJwtAuthGuard);

    const moduleRef = await moduleBuilder.compile();
    const app = moduleRef.createNestApplication();
    await app.init();

    return app;
  }

  it('allows an authenticated CLIENT on a client-only route', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .get('/role-tests/client-only')
      .set('Authorization', 'Bearer CLIENT')
      .expect(200)
      .expect({ ok: true });

    await app.close();
  });

  it('returns 403 when the authenticated role is not allowed', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .get('/role-tests/client-only')
      .set('Authorization', 'Bearer TRANSPORTER')
      .expect(403);

    await app.close();
  });

  it('allows any declared role on a multi-role route', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .get('/role-tests/client-or-transporter')
      .set('Authorization', 'Bearer TRANSPORTER')
      .expect(200)
      .expect({ ok: true });

    await app.close();
  });

  it('does not block authenticated routes without role metadata', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .get('/role-tests/authenticated')
      .set('Authorization', 'Bearer ADMIN')
      .expect(200)
      .expect({ ok: true });

    await app.close();
  });
});
