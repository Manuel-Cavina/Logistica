import { UnauthorizedException } from '@nestjs/common';
import { AuthSessionService } from './auth-session.service';

interface SessionInputAssertion {
  accountId: string;
  tokenFamily: string;
  tokenHash: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  expiresAt: Date;
}

describe('AuthSessionService', () => {
  const activeSession = {
    id: 'current-session-id',
    accountId: 'client-account-id',
    tokenFamily: 'token-family',
    tokenHash:
      '2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b',
    expiresAt: new Date('2026-03-25T12:00:00.000Z'),
    revokedAt: null,
    account: {
      id: 'client-account-id',
      email: 'client@example.com',
      role: 'CLIENT',
      isEmailVerified: false,
    },
  };
  const accountsService = {
    createSession: jest.fn(),
    findSessionById: jest.fn(),
    rotateSession: jest.fn(),
    revokeSessionFamily: jest.fn(),
  };
  const authTokenService = {
    createSessionId: jest.fn(),
    createTokenFamily: jest.fn(),
    getRefreshTokenExpirationDate: jest.fn(),
    hashRefreshToken: jest.fn(),
    matchesRefreshTokenHash: jest.fn(),
    signAccessToken: jest.fn(),
    signRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  };

  let authSessionService: AuthSessionService;

  beforeEach(() => {
    jest.clearAllMocks();
    authTokenService.createSessionId
      .mockReturnValueOnce('session-id')
      .mockReturnValueOnce('next-session-id');
    authTokenService.createTokenFamily.mockReturnValue('token-family');
    authTokenService.getRefreshTokenExpirationDate.mockReturnValue(
      new Date('2026-03-25T12:00:00.000Z'),
    );
    authTokenService.hashRefreshToken.mockReturnValue(
      '2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b',
    );
    authTokenService.matchesRefreshTokenHash.mockReturnValue(true);
    authSessionService = new AuthSessionService(
      accountsService as never,
      authTokenService as never,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates the initial login session and persists the hashed refresh token', async () => {
    authTokenService.signRefreshToken.mockResolvedValue('refresh-token');
    authTokenService.signAccessToken.mockResolvedValue('access-token');
    accountsService.createSession.mockResolvedValue({ id: 'session-id' });

    await expect(
      authSessionService.createLoginSession(
        {
          id: 'client-account-id',
          email: 'client@example.com',
          role: 'CLIENT',
          isEmailVerified: false,
        } as never,
        {
          ipAddress: '127.0.0.1',
          userAgent: 'jest',
        },
      ),
    ).resolves.toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    const createSessionInput = accountsService.createSession.mock
      .calls[0]?.[0] as SessionInputAssertion | undefined;

    expect(createSessionInput).toBeDefined();
    expect(createSessionInput?.accountId).toBe('client-account-id');
    expect(createSessionInput?.tokenFamily).toBe('token-family');
    expect(createSessionInput?.tokenHash).toBe(
      '2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b',
    );
    expect(createSessionInput?.userAgent).toBe('jest');
    expect(createSessionInput?.ipAddress).toBe('127.0.0.1');
  });

  it('refreshes an active session and rotates the refresh token', async () => {
    authTokenService.verifyRefreshToken.mockResolvedValue({
      sub: 'client-account-id',
      sid: 'current-session-id',
      family: 'token-family',
    });
    accountsService.findSessionById.mockResolvedValue(activeSession);
    authTokenService.signRefreshToken.mockResolvedValue(
      'rotated-refresh-token',
    );
    accountsService.rotateSession.mockResolvedValue({ id: 'next-session-id' });
    authTokenService.signAccessToken.mockResolvedValue('rotated-access-token');

    await expect(
      authSessionService.refreshSession('secret', {
        ipAddress: '127.0.0.1',
        userAgent: 'jest',
      }),
    ).resolves.toEqual({
      accessToken: 'rotated-access-token',
      refreshToken: 'rotated-refresh-token',
    });

    expect(accountsService.rotateSession).toHaveBeenCalledWith(
      'current-session-id',
      expect.objectContaining({
        accountId: 'client-account-id',
        tokenFamily: 'token-family',
        userAgent: 'jest',
        ipAddress: '127.0.0.1',
        expiresAt: new Date('2026-03-25T12:00:00.000Z'),
      }),
    );
    expect(accountsService.revokeSessionFamily).not.toHaveBeenCalled();
  });

  it('revokes the family when a rotated refresh token is reused', async () => {
    authTokenService.verifyRefreshToken.mockResolvedValue({
      sub: 'client-account-id',
      sid: 'current-session-id',
      family: 'token-family',
    });
    accountsService.findSessionById.mockResolvedValue({
      ...activeSession,
      revokedAt: new Date('2026-03-18T12:00:00.000Z'),
    });

    await expect(
      authSessionService.refreshSession('secret', {
        ipAddress: '127.0.0.1',
        userAgent: 'jest',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(accountsService.revokeSessionFamily).toHaveBeenCalledWith(
      'client-account-id',
      'token-family',
    );
  });

  it('rejects refresh when the token is missing', async () => {
    await expect(
      authSessionService.refreshSession(null, {
        ipAddress: null,
        userAgent: null,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(authTokenService.verifyRefreshToken).not.toHaveBeenCalled();
  });

  it('rejects refresh when the session cannot be found', async () => {
    authTokenService.verifyRefreshToken.mockResolvedValue({
      sub: 'client-account-id',
      sid: 'current-session-id',
      family: 'token-family',
    });
    accountsService.findSessionById.mockResolvedValue(null);

    await expect(
      authSessionService.refreshSession('secret', {
        ipAddress: null,
        userAgent: null,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects refresh when the stored hash does not match the presented token', async () => {
    authTokenService.verifyRefreshToken.mockResolvedValue({
      sub: 'client-account-id',
      sid: 'current-session-id',
      family: 'token-family',
    });
    accountsService.findSessionById.mockResolvedValue(activeSession);
    authTokenService.matchesRefreshTokenHash.mockReturnValue(false);

    await expect(
      authSessionService.refreshSession('secret', {
        ipAddress: null,
        userAgent: null,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(accountsService.rotateSession).not.toHaveBeenCalled();
  });

  it('rejects refresh when the session is expired', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-03-26T12:00:00.000Z'));
    authTokenService.verifyRefreshToken.mockResolvedValue({
      sub: 'client-account-id',
      sid: 'current-session-id',
      family: 'token-family',
    });
    accountsService.findSessionById.mockResolvedValue(activeSession);

    await expect(
      authSessionService.refreshSession('secret', {
        ipAddress: null,
        userAgent: null,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(accountsService.rotateSession).not.toHaveBeenCalled();
  });

  it('revokes the family when session rotation loses the race', async () => {
    authTokenService.verifyRefreshToken.mockResolvedValue({
      sub: 'client-account-id',
      sid: 'current-session-id',
      family: 'token-family',
    });
    accountsService.findSessionById.mockResolvedValue(activeSession);
    authTokenService.signRefreshToken.mockResolvedValue(
      'rotated-refresh-token',
    );
    accountsService.rotateSession.mockResolvedValue(null);

    await expect(
      authSessionService.refreshSession('secret', {
        ipAddress: null,
        userAgent: null,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(accountsService.revokeSessionFamily).toHaveBeenCalledWith(
      'client-account-id',
      'token-family',
    );
  });
});
