import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import type { IRegisterResponse } from '@logistica/shared';
import { AccountsService } from '../accounts/accounts.service';
import type { AccountWithProfiles } from '../accounts/accounts.types';
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

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toRegisterResponse(account: AccountWithProfiles): IRegisterResponse {
    return {
      account: {
        id: account.id,
        email: account.email,
        role: account.role,
        isEmailVerified: account.isEmailVerified,
      },
    };
  }
}
