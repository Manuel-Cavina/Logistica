import type { ILoginResponse, IRefreshResponse } from '@logistica/shared';

export interface AuthRequestContext {
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface RefreshTokenPayload {
  sub: string;
  sid: string;
  family: string;
  iat?: number;
  exp?: number;
}

export interface LoginResult {
  response: ILoginResponse;
  refreshToken: string;
}

export interface RefreshResult {
  response: IRefreshResponse;
  refreshToken: string;
}

export interface RefreshCookieConfiguration {
  name: string;
  setOptions: RefreshCookieOptions;
  clearOptions: RefreshCookieOptions;
}

export interface AuthConfiguration {
  accessTokenSecret: string;
  accessTokenTtlSeconds: number;
  refreshTokenSecret: string;
  refreshTokenTtlSeconds: number;
  refreshCookie: RefreshCookieConfiguration;
}

export interface RefreshCookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: boolean | 'lax' | 'strict' | 'none';
  path?: string;
  domain?: string;
  maxAge?: number;
}
