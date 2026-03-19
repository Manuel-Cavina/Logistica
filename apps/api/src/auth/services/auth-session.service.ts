import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AccountsService } from '../../accounts/accounts.service';
import type {
  AccountWithProfiles,
  CreateSessionInput,
} from '../../accounts/accounts.types';
import type { AuthRequestContext } from '../auth.types';
import { AuthTokenService } from './auth-token.service';

@Injectable()
export class AuthSessionService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async createLoginSession(
    account: AccountWithProfiles,
    context: AuthRequestContext,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const sessionId = this.authTokenService.createSessionId();
    const tokenFamily = this.authTokenService.createTokenFamily();
    const refreshToken = await this.authTokenService.signRefreshToken({
      sub: account.id,
      sid: sessionId,
      family: tokenFamily,
    });
    const accessToken = await this.authTokenService.signAccessToken(account);

    await this.accountsService.createSession(
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
    const session = await this.accountsService.findSessionById(payload.sid);

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
      await this.accountsService.revokeSessionFamily(
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
    const rotatedSession = await this.accountsService.rotateSession(
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
      await this.accountsService.revokeSessionFamily(
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
      const session = await this.accountsService.findSessionById(payload.sid);

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

      await this.accountsService.revokeSession(session.id);
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
}
