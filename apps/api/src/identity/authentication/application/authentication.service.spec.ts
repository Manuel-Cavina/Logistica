import {
  BadRequestException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@logistica/database';
import { AuthenticationService } from './authentication.service';

describe('AuthenticationService', () => {
  const accountsService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    createClientAccount: jest.fn(),
    createTransporterAccount: jest.fn(),
  };
  const passwordService = {
    hash: jest.fn(),
    verify: jest.fn(),
  };
  const authSessionService = {
    createLoginSession: jest.fn(),
    refreshSession: jest.fn(),
    logoutSession: jest.fn(),
  };

  let authenticationService: AuthenticationService;
  let loggerLogSpy: jest.SpyInstance;
  let loggerWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    loggerLogSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    authenticationService = new AuthenticationService(
      accountsService as never,
      passwordService as never,
      authSessionService as never,
    );
  });

  afterEach(() => {
    loggerLogSpy.mockRestore();
    loggerWarnSpy.mockRestore();
  });

  it('registers a CLIENT account with a normalized email', async () => {
    accountsService.findByEmail.mockResolvedValue(null);
    passwordService.hash.mockResolvedValue('hashed-password');
    accountsService.createClientAccount.mockResolvedValue({
      id: 'client-account-id',
      email: 'client@example.com',
      role: 'CLIENT',
      isEmailVerified: false,
    });

    await expect(
      authenticationService.register({
        role: 'CLIENT',
        email: '  CLIENT@Example.com ',
        password: 'supersafe123',
        firstName: 'Jane',
        lastName: 'Doe',
        phone: '+5491112345678',
      }),
    ).resolves.toEqual({
      account: {
        id: 'client-account-id',
        email: 'client@example.com',
        role: 'CLIENT',
        isEmailVerified: false,
      },
    });

    expect(accountsService.findByEmail).toHaveBeenCalledWith(
      'client@example.com',
    );
    expect(passwordService.hash).toHaveBeenCalledWith('supersafe123');
    expect(accountsService.createClientAccount).toHaveBeenCalledWith({
      email: 'client@example.com',
      passwordHash: 'hashed-password',
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '+5491112345678',
    });
  });

  it('registers a TRANSPORTER account with the minimum required profile', async () => {
    accountsService.findByEmail.mockResolvedValue(null);
    passwordService.hash.mockResolvedValue('hashed-password');
    accountsService.createTransporterAccount.mockResolvedValue({
      id: 'transporter-account-id',
      email: 'transporter@example.com',
      role: 'TRANSPORTER',
      isEmailVerified: false,
    });

    await expect(
      authenticationService.register({
        role: 'TRANSPORTER',
        email: 'transporter@example.com',
        password: 'supersafe123',
        displayName: 'Acme Transportes',
      }),
    ).resolves.toEqual({
      account: {
        id: 'transporter-account-id',
        email: 'transporter@example.com',
        role: 'TRANSPORTER',
        isEmailVerified: false,
      },
    });

    expect(accountsService.createTransporterAccount).toHaveBeenCalledWith({
      email: 'transporter@example.com',
      passwordHash: 'hashed-password',
      displayName: 'Acme Transportes',
    });
  });

  it('rejects duplicated emails before hashing or creating the account', async () => {
    accountsService.findByEmail.mockResolvedValue({
      id: 'existing-account-id',
    });

    await expect(
      authenticationService.register({
        role: 'CLIENT',
        email: 'client@example.com',
        password: 'supersafe123',
        firstName: 'Jane',
        lastName: 'Doe',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(passwordService.hash).not.toHaveBeenCalled();
    expect(accountsService.createClientAccount).not.toHaveBeenCalled();
    expect(accountsService.createTransporterAccount).not.toHaveBeenCalled();
  });

  it('maps database unique violations to the same generic register error', async () => {
    accountsService.findByEmail.mockResolvedValue(null);
    passwordService.hash.mockResolvedValue('hashed-password');
    accountsService.createClientAccount.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed.', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      authenticationService.register({
        role: 'CLIENT',
        email: 'client@example.com',
        password: 'supersafe123',
        firstName: 'Jane',
        lastName: 'Doe',
      }),
    ).rejects.toEqual(
      new BadRequestException('Unable to complete registration.'),
    );
  });

  it('delegates session creation after validating login credentials', async () => {
    accountsService.findByEmail.mockResolvedValue({
      id: 'client-account-id',
      email: 'client@example.com',
      role: 'CLIENT',
      isEmailVerified: false,
      passwordHash: 'stored-password-hash',
    });
    passwordService.verify.mockResolvedValue(true);
    authSessionService.createLoginSession.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    await expect(
      authenticationService.login(
        {
          email: '  CLIENT@Example.com ',
          password: 'supersafe123',
        },
        {
          ipAddress: '127.0.0.1',
          userAgent: 'jest',
        },
      ),
    ).resolves.toEqual({
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

    expect(authSessionService.createLoginSession).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'client-account-id',
        email: 'client@example.com',
      }),
      {
        ipAddress: '127.0.0.1',
        userAgent: 'jest',
      },
    );
    expect(loggerLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('"event":"login_success"'),
    );
  });

  it('delegates refresh to the session service', async () => {
    authSessionService.refreshSession.mockResolvedValue({
      accessToken: 'rotated-access-token',
      refreshToken: 'rotated-refresh-token',
    });

    await expect(
      authenticationService.refresh('refresh-token', {
        ipAddress: '127.0.0.1',
        userAgent: 'jest',
      }),
    ).resolves.toEqual({
      response: {
        accessToken: 'rotated-access-token',
      },
      refreshToken: 'rotated-refresh-token',
    });

    expect(authSessionService.refreshSession).toHaveBeenCalledWith(
      'refresh-token',
      {
        ipAddress: '127.0.0.1',
        userAgent: 'jest',
      },
    );
  });

  it('delegates logout to the session service', async () => {
    authSessionService.logoutSession.mockResolvedValue(undefined);

    await expect(
      authenticationService.logout('refresh-token'),
    ).resolves.toBeUndefined();

    expect(authSessionService.logoutSession).toHaveBeenCalledWith(
      'refresh-token',
    );
  });

  it('returns the same generic error when the account does not exist', async () => {
    accountsService.findByEmail.mockResolvedValue(null);

    await expect(
      authenticationService.login(
        {
          email: 'missing@example.com',
          password: 'supersafe123',
        },
        {
          ipAddress: null,
          userAgent: null,
        },
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(passwordService.verify).not.toHaveBeenCalled();
    expect(authSessionService.createLoginSession).not.toHaveBeenCalled();
    expect(loggerWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('"event":"login_failed"'),
    );
  });

  it('returns the same generic error when the password is invalid', async () => {
    accountsService.findByEmail.mockResolvedValue({
      id: 'client-account-id',
      email: 'client@example.com',
      role: 'CLIENT',
      isEmailVerified: false,
      passwordHash: 'stored-password-hash',
    });
    passwordService.verify.mockResolvedValue(false);

    await expect(
      authenticationService.login(
        {
          email: 'client@example.com',
          password: 'wrong-password',
        },
        {
          ipAddress: null,
          userAgent: null,
        },
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(authSessionService.createLoginSession).not.toHaveBeenCalled();
    expect(loggerWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('"event":"login_failed"'),
    );
  });

  it('logs register_attempt before checking the account', async () => {
    accountsService.findByEmail.mockResolvedValue({
      id: 'existing-account-id',
    });

    await expect(
      authenticationService.register({
        role: 'CLIENT',
        email: 'client@example.com',
        password: 'supersafe123',
        firstName: 'Jane',
        lastName: 'Doe',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(loggerLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('"event":"register_attempt"'),
    );
  });

  it('returns the authenticated account with only safe public fields', async () => {
    accountsService.findById.mockResolvedValue({
      id: 'client-account-id',
      email: 'client@example.com',
      role: 'CLIENT',
      isEmailVerified: true,
      passwordHash: 'stored-password-hash',
      userProfile: {
        id: 'profile-id',
        firstName: 'Jane',
        lastName: 'Doe',
        phone: '+5491112345678',
      },
      transporterProfile: null,
    });

    await expect(
      authenticationService.getCurrentAccount('client-account-id'),
    ).resolves.toEqual({
      id: 'client-account-id',
      email: 'client@example.com',
      role: 'CLIENT',
    });

    expect(accountsService.findById).toHaveBeenCalledWith('client-account-id');
  });

  it('rejects auth/me when the authenticated account no longer exists', async () => {
    accountsService.findById.mockResolvedValue(null);

    await expect(
      authenticationService.getCurrentAccount('missing-account-id'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
