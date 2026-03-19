import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { IRegisterResponse } from '@logistica/shared';
import { AccountsService } from '../accounts/accounts.service';
import type { AccountWithProfiles } from '../accounts/accounts.types';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import { PasswordService } from './password.service';
import { AuthSessionService } from './services/auth-session.service';
import type {
  AuthRequestContext,
  LoginResult,
  RefreshResult,
} from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly passwordService: PasswordService,
    private readonly authSessionService: AuthSessionService,
  ) {}

  async register(registerDto: RegisterDto): Promise<IRegisterResponse> {
    const normalizedEmail = this.normalizeEmail(registerDto.email);
    const existingAccount =
      await this.accountsService.findByEmail(normalizedEmail);

    if (existingAccount) {
      throw new ConflictException('An account with this email already exists.');
    }

    const passwordHash = await this.passwordService.hash(registerDto.password);

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
          businessName: registerDto.businessName ?? null,
          contactPhone: registerDto.contactPhone ?? null,
          bio: registerDto.bio ?? null,
        });

        return this.toRegisterResponse(account);
      }
      default: {
        throw new BadRequestException(
          'Public registration only supports CLIENT and TRANSPORTER roles.',
        );
      }
    }
  }

  async login(
    loginDto: LoginDto,
    context: AuthRequestContext,
  ): Promise<LoginResult> {
    const normalizedEmail = this.normalizeEmail(loginDto.email);
    const account = await this.accountsService.findByEmail(normalizedEmail);

    if (!account) {
      throw this.invalidAuthAttempt();
    }

    const isPasswordValid = await this.passwordService.verify(
      loginDto.password,
      account.passwordHash,
    );

    if (!isPasswordValid) {
      throw this.invalidAuthAttempt();
    }

    const sessionTokens = await this.authSessionService.createLoginSession(
      account,
      context,
    );

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

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toRegisterResponse(account: AccountWithProfiles): IRegisterResponse {
    return {
      account: this.toAuthAccount(account),
    };
  }

  private toAuthAccount(account: AccountWithProfiles) {
    return {
      id: account.id,
      email: account.email,
      role: account.role,
      isEmailVerified: account.isEmailVerified,
    };
  }

  private invalidAuthAttempt(): UnauthorizedException {
    return new UnauthorizedException('Invalid credentials.');
  }
}
