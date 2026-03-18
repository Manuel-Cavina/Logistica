import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { ILoginResponse, IRegisterResponse } from '@logistica/shared';
import { AccountsService } from '../accounts/accounts.service';
import type { AccountWithProfiles } from '../accounts/accounts.types';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import { PasswordService } from './password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly passwordService: PasswordService,
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

  async login(loginDto: LoginDto): Promise<ILoginResponse> {
    const normalizedEmail = this.normalizeEmail(loginDto.email);
    const account = await this.accountsService.findByEmail(normalizedEmail);

    if (!account) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await this.passwordService.verify(
      loginDto.password,
      account.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.toLoginResponse(account);
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toLoginResponse(account: AccountWithProfiles): ILoginResponse {
    return {
      account: this.toAuthAccount(account),
    };
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
}
