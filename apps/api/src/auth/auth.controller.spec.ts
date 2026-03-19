import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

function getSetCookieHeader(response: {
  headers: Record<string, unknown>;
}): string {
  const setCookieHeader = response.headers['set-cookie'];

  if (
    !Array.isArray(setCookieHeader) ||
    typeof setCookieHeader[0] !== 'string'
  ) {
    throw new Error('Expected Set-Cookie header');
  }

  return setCookieHeader[0];
}

function expectRefreshCookieAttributes(
  setCookieHeader: string,
  expectedName: string,
): void {
  expect(setCookieHeader).toContain(`${expectedName}=`);
  expect(setCookieHeader).toContain('HttpOnly');
  expect(setCookieHeader).toContain('SameSite=Lax');
  expect(setCookieHeader).toContain('Path=/');
  expect(setCookieHeader).not.toContain('Secure');
}

describe('AuthController', () => {
  type RequestContext = {
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  const authService = {
    login: jest.fn(),
    refresh: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  };
  const configService = {
    get: jest.fn(),
    getOrThrow: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    configService.get.mockImplementation((key: string) => {
      if (key === 'NODE_ENV') {
        return 'test';
      }

      if (key === 'AUTH_REFRESH_COOKIE_NAME') {
        return 'refresh_token';
      }

      return undefined;
    });
    configService.getOrThrow.mockImplementation((key: string) => {
      switch (key) {
        case 'AUTH_ACCESS_TOKEN_SECRET':
          return 'access-secret';
        case 'AUTH_REFRESH_TOKEN_SECRET':
          return 'refresh-secret';
        case 'AUTH_ACCESS_TOKEN_TTL_SECONDS':
          return '900';
        case 'AUTH_REFRESH_TOKEN_TTL_SECONDS':
          return '604800';
        default:
          throw new Error(`Missing config for ${key}`);
      }
    });
  });

  async function createApp() {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    return app;
  }

  it('returns 201 and the public account payload for a valid request', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    authService.register.mockResolvedValue({
      account: {
        id: 'client-account-id',
        email: 'client@example.com',
        role: 'CLIENT',
        isEmailVerified: false,
      },
    });

    await request(server)
      .post('/auth/register')
      .send({
        role: 'CLIENT',
        email: 'client@example.com',
        password: 'supersafe123',
        firstName: 'Jane',
        lastName: 'Doe',
      })
      .expect(201)
      .expect({
        account: {
          id: 'client-account-id',
          email: 'client@example.com',
          role: 'CLIENT',
          isEmailVerified: false,
        },
      });

    expect(authService.register).toHaveBeenCalledWith({
      role: 'CLIENT',
      email: 'client@example.com',
      password: 'supersafe123',
      firstName: 'Jane',
      lastName: 'Doe',
    });

    await app.close();
  });

  it('returns 400 for an invalid payload before reaching the service', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/auth/register')
      .send({
        role: 'ADMIN',
        email: 'admin@example.com',
        password: 'supersafe123',
      })
      .expect(400);

    expect(authService.register).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 409 when the service rejects a duplicated email', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    authService.register.mockRejectedValue(
      new ConflictException('An account with this email already exists.'),
    );

    await request(server)
      .post('/auth/register')
      .send({
        role: 'CLIENT',
        email: 'client@example.com',
        password: 'supersafe123',
        firstName: 'Jane',
        lastName: 'Doe',
      })
      .expect(409);

    await app.close();
  });

  it('returns 200, sets the refresh cookie and returns the access token for a valid login request', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    authService.login.mockResolvedValue({
      response: {
        account: {
          id: 'client-account-id',
          email: 'client@example.com',
          role: 'CLIENT',
          isEmailVerified: false,
        },
        accessToken: 'access-token',
      },
      refreshToken: 'refresh-token',
    });

    const response = await request(server)
      .post('/auth/login')
      .send({
        email: 'client@example.com',
        password: 'supersafe123',
      })
      .expect(200)
      .expect({
        account: {
          id: 'client-account-id',
          email: 'client@example.com',
          role: 'CLIENT',
          isEmailVerified: false,
        },
        accessToken: 'access-token',
      });

    expectRefreshCookieAttributes(
      getSetCookieHeader(response),
      'refresh_token',
    );

    const loginCall = authService.login.mock.calls as
      | [unknown, RequestContext][]
      | undefined;
    const loginContext = loginCall?.[0]?.[1];

    expect(authService.login).toHaveBeenCalledWith(
      {
        email: 'client@example.com',
        password: 'supersafe123',
      },
      loginContext,
    );
    expect(typeof loginContext?.ipAddress).toBe('string');
    expect(loginContext?.userAgent).toBeNull();

    await app.close();
  });

  it('returns 400 for an invalid login payload before reaching the service', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/auth/login')
      .send({
        email: 'invalid-email',
        password: 'supersafe123',
      })
      .expect(400);

    expect(authService.login).not.toHaveBeenCalled();

    await app.close();
  });

  it('returns 401 when the service rejects invalid credentials', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    authService.login.mockRejectedValue(
      new UnauthorizedException('Invalid credentials.'),
    );

    await request(server)
      .post('/auth/login')
      .send({
        email: 'client@example.com',
        password: 'supersafe123',
      })
      .expect(401);

    await app.close();
  });

  it('returns 200 and rotates the refresh cookie for a valid refresh request', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    authService.refresh.mockResolvedValue({
      response: {
        accessToken: 'rotated-access-token',
      },
      refreshToken: 'rotated-refresh-token',
    });

    const response = await request(server)
      .post('/auth/refresh')
      .set('Cookie', 'refresh_token=previous-refresh-token')
      .expect(200)
      .expect({
        accessToken: 'rotated-access-token',
      });

    expectRefreshCookieAttributes(
      getSetCookieHeader(response),
      'refresh_token',
    );

    const refreshCall = authService.refresh.mock.calls as
      | [unknown, RequestContext][]
      | undefined;
    const refreshContext = refreshCall?.[0]?.[1];

    expect(authService.refresh).toHaveBeenCalledWith(
      'previous-refresh-token',
      refreshContext,
    );
    expect(typeof refreshContext?.ipAddress).toBe('string');
    expect(refreshContext?.userAgent).toBeNull();

    await app.close();
  });

  it('returns 401 and clears the cookie when the refresh cookie is missing', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    authService.refresh.mockRejectedValue(
      new UnauthorizedException('Invalid credentials.'),
    );

    const response = await request(server).post('/auth/refresh').expect(401);

    const setCookieHeader = getSetCookieHeader(response);

    expect(setCookieHeader).toContain('refresh_token=;');
    expect(setCookieHeader).toContain('HttpOnly');
    expect(setCookieHeader).toContain('SameSite=Lax');
    expect(setCookieHeader).toContain('Path=/');
    expect(setCookieHeader).not.toContain('Secure');
    expect(authService.refresh).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        ipAddress: expect.any(String),
        userAgent: null,
      }),
    );

    await app.close();
  });

  it('clears the cookie when refresh is rejected', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    authService.refresh.mockRejectedValue(
      new UnauthorizedException('Invalid credentials.'),
    );

    const response = await request(server)
      .post('/auth/refresh')
      .set('Cookie', 'refresh_token=stale-refresh-token')
      .expect(401);

    const setCookieHeader = getSetCookieHeader(response);

    expect(setCookieHeader).toContain('refresh_token=;');
    expect(setCookieHeader).toContain('HttpOnly');
    expect(setCookieHeader).toContain('SameSite=Lax');
    expect(setCookieHeader).toContain('Path=/');
    expect(setCookieHeader).not.toContain('Secure');

    await app.close();
  });

  it('returns 204 and clears the refresh cookie on logout', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    authService.logout.mockResolvedValue(undefined);

    const response = await request(server)
      .post('/auth/logout')
      .set('Cookie', 'refresh_token=active-refresh-token')
      .expect(204);

    const setCookieHeader = getSetCookieHeader(response);

    expect(authService.logout).toHaveBeenCalledWith('active-refresh-token');
    expect(setCookieHeader).toContain('refresh_token=;');
    expect(setCookieHeader).toContain('HttpOnly');
    expect(setCookieHeader).toContain('SameSite=Lax');
    expect(setCookieHeader).toContain('Path=/');
    expect(setCookieHeader).not.toContain('Secure');

    await app.close();
  });

  it('returns 204 and clears the refresh cookie on logout when there is no cookie', async () => {
    const app = await createApp();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    authService.logout.mockResolvedValue(undefined);

    const response = await request(server).post('/auth/logout').expect(204);

    const setCookieHeader = getSetCookieHeader(response);

    expect(authService.logout).toHaveBeenCalledWith(null);
    expect(setCookieHeader).toContain('refresh_token=;');
    expect(setCookieHeader).toContain('HttpOnly');
    expect(setCookieHeader).toContain('SameSite=Lax');
    expect(setCookieHeader).toContain('Path=/');
    expect(setCookieHeader).not.toContain('Secure');

    await app.close();
  });
});
