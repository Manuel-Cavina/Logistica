import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@logistica/database';
import type { IMeResponse, IRegisterResponse } from '@logistica/shared';
import { AccountsService } from '../../accounts/application/accounts.service';
import {
  DEVELOPMENT_ADMIN_ACCOUNT_ID,
  getDevelopmentAdminAuthConfiguration,
  type DevelopmentAdminAuthConfiguration,
} from '../development-admin-auth.config';
import type { LoginDto } from '../dto/login.dto';
import type { RegisterDto } from '../dto/register.dto';
import type {
  AuthenticatedAccount,
  AuthRequestContext,
  AuthSessionAccount,
  LoginResult,
  RefreshResult,
} from '../types/authentication.types';
import { AuthSessionService } from './auth-session.service';
import { PasswordService } from './password.service';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);
  private readonly developmentAdminAuth: DevelopmentAdminAuthConfiguration;

  constructor(
    private readonly accountsService: AccountsService,
    private readonly passwordService: PasswordService,
    private readonly authSessionService: AuthSessionService,
    configService: ConfigService,
  ) {
    this.developmentAdminAuth =
      getDevelopmentAdminAuthConfiguration(configService);
  }

  async register(registerDto: RegisterDto): Promise<IRegisterResponse> {
    const normalizedEmail = this.normalizeEmail(registerDto.email);

    this.logInfo('register_attempt', {
      email: normalizedEmail,
      role: registerDto.role,
    });

    const existingAccount =
      await this.accountsService.findByEmail(normalizedEmail);

    if (existingAccount) {
      throw this.registrationFailed();
    }

    const passwordHash = await this.passwordService.hash(registerDto.password);

    try {
      switch (registerDto.role) {
        case 'CLIENT': {
          const account = await this.accountsService.createClientAccount({
            email: normalizedEmail,
            passwordHash,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            phone: registerDto.phone ?? null,
          });

          return this.toRegisterResponse(account);
        }
        case 'TRANSPORTER': {
          const account = await this.accountsService.createTransporterAccount({
            email: normalizedEmail,
            passwordHash,
            displayName: registerDto.displayName,
          });

          return this.toRegisterResponse(account);
        }
        default: {
          throw new BadRequestException(
            'Public registration only supports CLIENT and TRANSPORTER roles.',
          );
        }
      }
    } catch (error) {
      if (this.isUniqueConstraintViolation(error)) {
        throw this.registrationFailed();
      }

      throw error;
    }
  }

  async login(
    loginDto: LoginDto,
    context: AuthRequestContext,
  ): Promise<LoginResult> {
    const normalizedEmail = this.normalizeEmail(loginDto.email);
    const developmentAdminAccount = this.getDevelopmentAdminAccount(
      normalizedEmail,
      loginDto.password,
    );

    if (developmentAdminAccount) {
      const sessionTokens = await this.authSessionService.createLoginSession(
        developmentAdminAccount,
        context,
      );

      this.logInfo('login_success', {
        accountId: developmentAdminAccount.id,
        email: normalizedEmail,
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
      });

      return {
        response: {
          account: this.toAuthAccount(developmentAdminAccount),
          accessToken: sessionTokens.accessToken,
        },
        refreshToken: sessionTokens.refreshToken,
      };
    }

    const account = await this.accountsService.findByEmail(normalizedEmail);

    if (!account) {
      this.logWarn('login_failed', {
        email: normalizedEmail,
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
      });

      throw this.invalidAuthAttempt();
    }

    const isPasswordValid = await this.passwordService.verify(
      loginDto.password,
      account.passwordHash,
    );

    if (!isPasswordValid) {
      this.logWarn('login_failed', {
        email: normalizedEmail,
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
      });

      throw this.invalidAuthAttempt();
    }

    const sessionTokens = await this.authSessionService.createLoginSession(
      account,
      context,
    );

    this.logInfo('login_success', {
      accountId: account.id,
      email: normalizedEmail,
      ipAddress: context.ipAddress ?? null,
      userAgent: context.userAgent ?? null,
    });

    return {
      response: {
        account: this.toAuthAccount(account),
        accessToken: sessionTokens.accessToken,
      },
      refreshToken: sessionTokens.refreshToken,
    };
  }

  async refresh(
    refreshToken: string | null | undefined,
    context: AuthRequestContext,
  ): Promise<RefreshResult> {
    const sessionTokens = await this.authSessionService.refreshSession(
      refreshToken,
      context,
    );

    return {
      response: {
        accessToken: sessionTokens.accessToken,
      },
      refreshToken: sessionTokens.refreshToken,
    };
  }

  async logout(refreshToken: string | null | undefined): Promise<void> {
    await this.authSessionService.logoutSession(refreshToken);
  }

  async getCurrentAccount(
    authenticatedAccount: AuthenticatedAccount,
  ): Promise<IMeResponse> {
    if (authenticatedAccount.isMockAdmin) {
      const developmentAdminAccount = this.getDevelopmentAdminAccountById(
        authenticatedAccount.accountId,
      );

      if (!developmentAdminAccount) {
        throw this.invalidAuthAttempt();
      }

      return this.toMeResponse(developmentAdminAccount);
    }

    const account = await this.accountsService.findById(
      authenticatedAccount.accountId,
    );

    if (!account) {
      throw this.invalidAuthAttempt();
    }

    return this.toMeResponse(account);
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private maskEmail(email: string): string {
    const [localPart, domainPart] = email.split('@');

    if (!localPart || !domainPart) {
      return '[invalid-email]';
    }

    const visibleLocalPart = localPart.slice(0, 1);

    return `${visibleLocalPart}***@${domainPart}`;
  }

  private toRegisterResponse(account: AuthSessionAccount): IRegisterResponse {
    return {
      account: this.toAuthAccount(account),
    };
  }

  private toAuthAccount(account: AuthSessionAccount) {
    return {
      id: account.id,
      email: account.email,
      role: account.role,
      isEmailVerified: account.isEmailVerified,
    };
  }

  private toMeResponse(account: AuthSessionAccount): IMeResponse {
    return {
      id: account.id,
      email: account.email,
      role: account.role,
    };
  }

  private logInfo(
    event: 'login_success' | 'register_attempt',
    payload: Record<string, string | null>,
  ): void {
    this.logger.log(
      JSON.stringify({
        event,
        ...payload,
        email: payload.email ? this.maskEmail(payload.email) : null,
      }),
    );
  }

  private logWarn(
    event: 'login_failed',
    payload: Record<string, string | null>,
  ): void {
    this.logger.warn(
      JSON.stringify({
        event,
        ...payload,
        email: payload.email ? this.maskEmail(payload.email) : null,
      }),
    );
  }

  private registrationFailed(): BadRequestException {
    return new BadRequestException('Unable to complete registration.');
  }

  private invalidAuthAttempt(): UnauthorizedException {
    return new UnauthorizedException('Invalid credentials.');
  }

  private isUniqueConstraintViolation(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }

  private getDevelopmentAdminAccount(
    email: string,
    password: string,
  ): AuthSessionAccount | null {
    if (
      !this.developmentAdminAuth.enabled ||
      email !== this.developmentAdminAuth.email ||
      password !== this.developmentAdminAuth.password
    ) {
      return null;
    }

    return this.getDevelopmentAdminAccountById(DEVELOPMENT_ADMIN_ACCOUNT_ID);
  }

  private getDevelopmentAdminAccountById(
    accountId: string,
  ): AuthSessionAccount | null {
    if (
      !this.developmentAdminAuth.enabled ||
      accountId !== DEVELOPMENT_ADMIN_ACCOUNT_ID
    ) {
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
}
