import type { ConfigService } from '@nestjs/config';
import { getAuthConfiguration } from './auth.config';

function createConfigService(
  overrides?: Record<string, string>,
): ConfigService {
  const values: Record<string, string> = {
    NODE_ENV: 'development',
    AUTH_ACCESS_TOKEN_SECRET: 'access-secret',
    AUTH_REFRESH_TOKEN_SECRET: 'refresh-secret',
    AUTH_ACCESS_TOKEN_TTL_SECONDS: '900',
    AUTH_REFRESH_TOKEN_TTL_SECONDS: '604800',
    AUTH_REFRESH_COOKIE_NAME: 'refresh_token',
    ...overrides,
  };

  return {
    get: jest.fn((key: string) => values[key]),
    getOrThrow: jest.fn((key: string) => {
      const value = values[key];

      if (typeof value !== 'string') {
        throw new Error(`Missing config for ${key}`);
      }

      return value;
    }),
  } as unknown as ConfigService;
}

describe('getAuthConfiguration', () => {
  it('builds a host-wide lax refresh cookie outside production', () => {
    const authConfig = getAuthConfiguration(createConfigService());

    expect(authConfig.refreshCookie).toEqual({
      name: 'refresh_token',
      setOptions: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 604800000,
      },
      clearOptions: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
      },
    });
  });

  it('uses a __Host- prefixed cookie name and Secure in production', () => {
    const authConfig = getAuthConfiguration(
      createConfigService({
        NODE_ENV: 'production',
      }),
    );

    expect(authConfig.refreshCookie.name).toBe('__Host-refresh_token');
    expect(authConfig.refreshCookie.setOptions.secure).toBe(true);
    expect(authConfig.refreshCookie.clearOptions.secure).toBe(true);
  });

  it('does not add the __Host- prefix twice', () => {
    const authConfig = getAuthConfiguration(
      createConfigService({
        NODE_ENV: 'production',
        AUTH_REFRESH_COOKIE_NAME: '__Host-custom_refresh',
      }),
    );

    expect(authConfig.refreshCookie.name).toBe('__Host-custom_refresh');
  });
});
