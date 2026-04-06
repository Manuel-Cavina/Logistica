import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SessionsRepository } from '../repositories/sessions.repository';
import {
  DEVELOPMENT_ADMIN_ACCOUNT_ID,
  getDevelopmentAdminAuthConfiguration,
  type DevelopmentAdminAuthConfiguration,
} from '../development-admin-auth.config';
import type {
  AuthRequestContext,
  AuthSessionAccount,
  CreateSessionInput,
} from '../types/authentication.types';
import { AuthTokenService } from './auth-token.service';

@Injectable()
export class AuthSessionService {
  private readonly developmentAdminAuth: DevelopmentAdminAuthConfiguration;

  constructor(
    private readonly sessionsRepository: SessionsRepository,
    private readonly authTokenService: AuthTokenService,
    configService: ConfigService,
  ) {
    this.developmentAdminAuth =
      getDevelopmentAdminAuthConfiguration(configService);
  }

  async createLoginSession(
    account: AuthSessionAccount,
    context: AuthRequestContext,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    if (this.isDevelopmentAdminAccount(account)) {
      return this.createDevelopmentAdminSession(account);
    }

    const sessionId = this.authTokenService.createSessionId();
    const tokenFamily = this.authTokenService.createTokenFamily();
    const refreshToken = await this.authTokenService.signRefreshToken({
      sub: account.id,
      sid: sessionId,
      family: tokenFamily,
    });
    const accessToken = await this.authTokenService.signAccessToken(account);

    await this.sessionsRepository.createSession(
      this.buildSessionInput({
        id: sessionId,
        accountId: account.id,
        tokenHash: this.authTokenService.hashRefreshToken(refreshToken),
        tokenFamily,
        context,
      }),
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshSession(
    refreshToken: string | null | undefined,
    context: AuthRequestContext,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    if (!refreshToken) {
      throw this.invalidAuthAttempt();
    }

    const payload =
      await this.authTokenService.verifyRefreshToken(refreshToken);

    if (payload.mockAdmin) {
      return this.refreshDevelopmentAdminSession(payload.family);
    }

    const session = await this.sessionsRepository.findSessionById(payload.sid);

    if (!session) {
      throw this.invalidAuthAttempt();
    }

    if (
      session.accountId !== payload.sub ||
      session.tokenFamily !== payload.family ||
      !this.authTokenService.matchesRefreshTokenHash(
        session.tokenHash,
        refreshToken,
      )
    ) {
      throw this.invalidAuthAttempt();
    }

    if (session.revokedAt) {
      await this.sessionsRepository.revokeSessionFamily(
        session.accountId,
        session.tokenFamily,
      );
      throw this.invalidAuthAttempt();
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      throw this.invalidAuthAttempt();
    }

    const successorSessionId = this.authTokenService.createSessionId();
    const successorRefreshToken = await this.authTokenService.signRefreshToken({
      sub: session.accountId,
      sid: successorSessionId,
      family: session.tokenFamily,
    });
    const rotatedSession = await this.sessionsRepository.rotateSession(
      session.id,
      this.buildSessionInput({
        id: successorSessionId,
        accountId: session.accountId,
        tokenHash: this.authTokenService.hashRefreshToken(
          successorRefreshToken,
        ),
        tokenFamily: session.tokenFamily,
        context,
      }),
    );

    if (!rotatedSession) {
      await this.sessionsRepository.revokeSessionFamily(
        session.accountId,
        session.tokenFamily,
      );
      throw this.invalidAuthAttempt();
    }

    return {
      accessToken: await this.authTokenService.signAccessToken(session.account),
      refreshToken: successorRefreshToken,
    };
  }

  async logoutSession(refreshToken: string | null | undefined): Promise<void> {
    if (!refreshToken) {
      return;
    }

    try {
      const payload =
        await this.authTokenService.verifyRefreshToken(refreshToken);

      if (payload.mockAdmin) {
        return;
      }

      const session = await this.sessionsRepository.findSessionById(
        payload.sid,
      );

      if (!session) {
        return;
      }

      if (
        session.accountId !== payload.sub ||
        session.tokenFamily !== payload.family ||
        session.revokedAt ||
        !this.authTokenService.matchesRefreshTokenHash(
          session.tokenHash,
          refreshToken,
        )
      ) {
        return;
      }

      await this.sessionsRepository.revokeSession(session.id);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return;
      }

      throw error;
    }
  }

  private buildSessionInput(input: {
    id: string;
    accountId: string;
    tokenHash: string;
    tokenFamily: string;
    context: AuthRequestContext;
  }): CreateSessionInput {
    return {
      id: input.id,
      accountId: input.accountId,
      tokenHash: input.tokenHash,
      tokenFamily: input.tokenFamily,
      expiresAt: this.authTokenService.getRefreshTokenExpirationDate(),
      userAgent: input.context.userAgent ?? null,
      ipAddress: input.context.ipAddress ?? null,
    };
  }

  private invalidAuthAttempt(): UnauthorizedException {
    return new UnauthorizedException('Invalid credentials.');
  }

  private async createDevelopmentAdminSession(
    account: AuthSessionAccount,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const sessionId = this.authTokenService.createSessionId();
    const tokenFamily = this.authTokenService.createTokenFamily();
    const refreshToken = await this.authTokenService.signRefreshToken({
      sub: account.id,
      sid: sessionId,
      family: tokenFamily,
      mockAdmin: true,
    });
    const accessToken = await this.authTokenService.signAccessToken(account);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async refreshDevelopmentAdminSession(
    tokenFamily: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const account = this.getDevelopmentAdminAccount();

    if (!account) {
      throw this.invalidAuthAttempt();
    }

    const successorSessionId = this.authTokenService.createSessionId();
    const successorRefreshToken = await this.authTokenService.signRefreshToken({
      sub: account.id,
      sid: successorSessionId,
      family: tokenFamily,
      mockAdmin: true,
    });

    return {
      accessToken: await this.authTokenService.signAccessToken(account),
      refreshToken: successorRefreshToken,
    };
  }

  private getDevelopmentAdminAccount(): AuthSessionAccount | null {
    if (!this.developmentAdminAuth.enabled) {
      return null;
    }

    return {
      id: DEVELOPMENT_ADMIN_ACCOUNT_ID,
      email: this.developmentAdminAuth.email,
      role: 'ADMIN',
      isEmailVerified: true,
      isMockAdmin: true,
    };
  }

  private isDevelopmentAdminAccount(account: AuthSessionAccount): boolean {
    return (
      account.isMockAdmin === true &&
      account.id === DEVELOPMENT_ADMIN_ACCOUNT_ID &&
      account.role === 'ADMIN'
    );
  }
}
