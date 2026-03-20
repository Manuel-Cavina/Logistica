import { UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { JwtAccessStrategy } from './jwt-access.strategy';

function createConfigService(): ConfigService {
  return {
    getOrThrow: jest.fn((key: string) => {
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
    }),
    get: jest.fn((key: string) => {
      if (key === 'NODE_ENV') {
        return 'test';
      }

      return undefined;
    }),
  } as unknown as ConfigService;
}

describe('JwtAccessStrategy', () => {
  let strategy: JwtAccessStrategy;

  beforeEach(() => {
    strategy = new JwtAccessStrategy(createConfigService());
  });

  it('maps the access token subject into the authenticated account context', () => {
    expect(
      strategy.validate({
        sub: 'client-account-id',
        role: 'CLIENT',
      }),
    ).toEqual({
      accountId: 'client-account-id',
    });
  });

  it('rejects access tokens without a valid subject', () => {
    expect(() =>
      strategy.validate({
        sub: '',
        role: 'CLIENT',
      }),
    ).toThrow(UnauthorizedException);
  });
});
