import { UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import { AuthTokenService } from './auth-token.service';

describe('AuthTokenService', () => {
  const jwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };
  const configService = {
    get: jest.fn(),
    getOrThrow: jest.fn(),
  };

  let authTokenService: AuthTokenService;

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
    authTokenService = new AuthTokenService(
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('signs access tokens with the configured secret and ttl', async () => {
    jwtService.signAsync.mockResolvedValue('access-token');

    await expect(
      authTokenService.signAccessToken({
        id: 'client-account-id',
        role: 'CLIENT',
      } as never),
    ).resolves.toBe('access-token');

    expect(jwtService.signAsync).toHaveBeenCalledWith(
      {
        sub: 'client-account-id',
        role: 'CLIENT',
      },
      {
        secret: 'access-secret',
        expiresIn: 900,
      },
    );
  });

  it('verifies refresh tokens with the configured secret', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'client-account-id',
      sid: 'session-id',
      family: 'token-family',
    });

    await expect(
      authTokenService.verifyRefreshToken('refresh-token'),
    ).resolves.toEqual({
      sub: 'client-account-id',
      sid: 'session-id',
      family: 'token-family',
    });
  });

  it('rejects malformed refresh payloads', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'client-account-id',
      family: 'token-family',
    });

    await expect(
      authTokenService.verifyRefreshToken('refresh-token'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns false when refresh hash lengths differ', () => {
    expect(
      authTokenService.matchesRefreshTokenHash('deadbeef', 'refresh-token'),
    ).toBe(false);
  });

  it('calculates refresh token expiration using the configured ttl', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-03-18T12:00:00.000Z'));

    expect(authTokenService.getRefreshTokenExpirationDate()).toEqual(
      new Date('2026-03-25T12:00:00.000Z'),
    );
  });
});
