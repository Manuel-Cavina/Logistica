import type { ConfigService } from '@nestjs/config';
import type { AuthConfiguration } from './auth.types';

const DEFAULT_REFRESH_COOKIE_NAME = 'refresh_token';
const DEFAULT_REFRESH_COOKIE_PATH = '/auth';

function parsePositiveInteger(value: string, key: string): number {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${key} must be a positive integer`);
  }

  return parsedValue;
}

export function getAuthConfiguration(
  configService: ConfigService,
): AuthConfiguration {
  const accessTokenSecret = configService.getOrThrow<string>(
    'AUTH_ACCESS_TOKEN_SECRET',
  );
  const refreshTokenSecret = configService.getOrThrow<string>(
    'AUTH_REFRESH_TOKEN_SECRET',
  );
  const accessTokenTtlSeconds = parsePositiveInteger(
    configService.getOrThrow<string>('AUTH_ACCESS_TOKEN_TTL_SECONDS'),
    'AUTH_ACCESS_TOKEN_TTL_SECONDS',
  );
  const refreshTokenTtlSeconds = parsePositiveInteger(
    configService.getOrThrow<string>('AUTH_REFRESH_TOKEN_TTL_SECONDS'),
    'AUTH_REFRESH_TOKEN_TTL_SECONDS',
  );
  const refreshCookieName =
    configService.get<string>('AUTH_REFRESH_COOKIE_NAME') ??
    DEFAULT_REFRESH_COOKIE_NAME;
  const isProduction =
    (configService.get<string>('NODE_ENV') ?? 'development') === 'production';

  return {
    accessTokenSecret,
    accessTokenTtlSeconds,
    refreshTokenSecret,
    refreshTokenTtlSeconds,
    refreshCookieName,
    refreshCookieOptions: {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: DEFAULT_REFRESH_COOKIE_PATH,
      maxAge: refreshTokenTtlSeconds * 1000,
    },
  };
}
