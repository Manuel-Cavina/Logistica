import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const accountsService = {
    findByEmail: jest.fn(),
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
  };

  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService(
      accountsService as never,
      passwordService as never,
      authSessionService as never,
    );
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
      authService.register({
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
      authService.register({
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
      businessName: null,
      contactPhone: null,
      bio: null,
    });
  });

  it('rejects duplicated emails before hashing or creating the account', async () => {
    accountsService.findByEmail.mockResolvedValue({
      id: 'existing-account-id',
    });

    await expect(
      authService.register({
        role: 'CLIENT',
        email: 'client@example.com',
        password: 'supersafe123',
        firstName: 'Jane',
        lastName: 'Doe',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(passwordService.hash).not.toHaveBeenCalled();
    expect(accountsService.createClientAccount).not.toHaveBeenCalled();
    expect(accountsService.createTransporterAccount).not.toHaveBeenCalled();
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
      authService.login(
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
  });

  it('delegates refresh to the session service', async () => {
    authSessionService.refreshSession.mockResolvedValue({
      accessToken: 'rotated-access-token',
      refreshToken: 'rotated-refresh-token',
    });

    await expect(
      authService.refresh('refresh-token', {
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

  it('returns the same generic error when the account does not exist', async () => {
    accountsService.findByEmail.mockResolvedValue(null);

    await expect(
      authService.login(
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
      authService.login(
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
  });
});
