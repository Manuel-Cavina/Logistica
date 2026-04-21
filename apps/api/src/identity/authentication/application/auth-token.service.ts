import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import type { AccountWithProfiles } from '../../accounts/types/accounts.types';
import { resolveEffectiveAccountRole } from '../authentication-role.utils';
import { getAuthenticationConfiguration } from '../cookies/authentication-cookie.config';
import type {
  AccessTokenPayload,
  AuthenticationConfiguration,
  AuthSessionAccount,
  RefreshTokenPayload,
} from '../types/authentication.types';

type SignableAccessTokenAccount = (AuthSessionAccount | AccountWithProfiles) & {
  isMockAdmin?: boolean;
};

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

  async signAccessToken(account: SignableAccessTokenAccount): Promise<string> {
    const payload: AccessTokenPayload = {
      sub: account.id,
      role: resolveEffectiveAccountRole(account),
      ...(account.isMockAdmin ? { mockAdmin: true } : {}),
    };

    return this.jwtService.signAsync(payload, {
      secret: this.authConfig.accessTokenSecret,
      expiresIn: this.authConfig.accessTokenTtlSeconds,
    });
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
      payload.family.length > 0 &&
      (payload.mockAdmin === undefined ||
        typeof payload.mockAdmin === 'boolean'),
    );
  }

  private invalidAuthAttempt(): UnauthorizedException {
    return new UnauthorizedException('Invalid credentials.');
  }
}
