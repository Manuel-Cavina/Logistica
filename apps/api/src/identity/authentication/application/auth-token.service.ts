import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import type { AccountWithProfiles } from '../../accounts/types/accounts.types';
import { getAuthenticationConfiguration } from '../cookies/authentication-cookie.config';
import type {
  AuthenticationConfiguration,
  RefreshTokenPayload,
} from '../types/authentication.types';

@Injectable()
export class AuthTokenService {
  private readonly authConfig: AuthenticationConfiguration;

  constructor(
    private readonly jwtService: JwtService,
    configService: ConfigService,
  ) {
    this.authConfig = getAuthenticationConfiguration(configService);
  }

  createSessionId(): string {
    return randomUUID();
  }

  createTokenFamily(): string {
    return randomUUID();
  }

  getRefreshTokenExpirationDate(): Date {
    return new Date(Date.now() + this.authConfig.refreshTokenTtlSeconds * 1000);
  }

  hashRefreshToken(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex');
  }

  matchesRefreshTokenHash(tokenHash: string, refreshToken: string): boolean {
    const presentedTokenHash = this.hashRefreshToken(refreshToken);
    const storedHashBuffer = Buffer.from(tokenHash, 'hex');
    const presentedHashBuffer = Buffer.from(presentedTokenHash, 'hex');

    if (storedHashBuffer.length !== presentedHashBuffer.length) {
      return false;
    }

    return timingSafeEqual(storedHashBuffer, presentedHashBuffer);
  }

  async signAccessToken(account: AccountWithProfiles): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: account.id,
        role: account.role,
      },
      {
        secret: this.authConfig.accessTokenSecret,
        expiresIn: this.authConfig.accessTokenTtlSeconds,
      },
    );
  }

  async signRefreshToken(payload: RefreshTokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.authConfig.refreshTokenSecret,
      expiresIn: this.authConfig.refreshTokenTtlSeconds,
    });
  }

  async verifyRefreshToken(refreshToken: string): Promise<RefreshTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this.authConfig.refreshTokenSecret,
        },
      );

      if (!this.isRefreshTokenPayload(payload)) {
        throw new Error('Invalid refresh token payload');
      }

      return payload;
    } catch {
      throw this.invalidAuthAttempt();
    }
  }

  private isRefreshTokenPayload(
    payload: RefreshTokenPayload | null | undefined,
  ): payload is RefreshTokenPayload {
    return Boolean(
      payload &&
        typeof payload.sub === 'string' &&
        payload.sub.length > 0 &&
        typeof payload.sid === 'string' &&
        payload.sid.length > 0 &&
        typeof payload.family === 'string' &&
        payload.family.length > 0,
    );
  }

  private invalidAuthAttempt(): UnauthorizedException {
    return new UnauthorizedException('Invalid credentials.');
  }
}
