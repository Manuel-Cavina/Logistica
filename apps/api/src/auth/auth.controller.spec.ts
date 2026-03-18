import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  const authService = {
    login: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 201 and the public account payload for a valid request', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    const app = moduleRef.createNestApplication();

    authService.register.mockResolvedValue({
      account: {
        id: 'client-account-id',
        email: 'client@example.com',
        role: 'CLIENT',
        isEmailVerified: false,
      },
    });

    await app.init();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

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
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    const app = moduleRef.createNestApplication();

    await app.init();
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
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    const app = moduleRef.createNestApplication();

    authService.register.mockRejectedValue(
      new ConflictException('An account with this email already exists.'),
    );

    await app.init();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

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

  it('returns 200 and the public account payload for a valid login request', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    const app = moduleRef.createNestApplication();

    authService.login.mockResolvedValue({
      account: {
        id: 'client-account-id',
        email: 'client@example.com',
        role: 'CLIENT',
        isEmailVerified: false,
      },
    });

    await app.init();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
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
      });

    expect(authService.login).toHaveBeenCalledWith({
      email: 'client@example.com',
      password: 'supersafe123',
    });

    await app.close();
  });

  it('returns 400 for an invalid login payload before reaching the service', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    const app = moduleRef.createNestApplication();

    await app.init();
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
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    const app = moduleRef.createNestApplication();

    authService.login.mockRejectedValue(
      new UnauthorizedException('Invalid credentials.'),
    );

    await app.init();
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    await request(server)
      .post('/auth/login')
      .send({
        email: 'client@example.com',
        password: 'supersafe123',
      })
      .expect(401);

    await app.close();
  });
});
