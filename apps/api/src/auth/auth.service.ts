import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AccountsService } from '../accounts/accounts.service';
import type { AccountWithProfiles } from '../accounts/accounts.types';
import { PasswordService } from './password.service';
import type {
  AuthUserView,
  LoginDto,
  RegisterClientDto,
  RegisterDto,
  RegisterTransporterDto,
} from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly passwordService: PasswordService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthUserView> {
    if (registerDto.role === 'ADMIN') {
      throw new BadRequestException('Public registration does not allow ADMIN');
    }

    const passwordHash = await this.passwordService.hash(registerDto.password);

    if (registerDto.role === 'CLIENT') {
      const account = await this.accountsService.createClientAccount(
        this.toCreateClientAccountInput(registerDto, passwordHash),
      );

      return this.toAuthUserView(account);
    }

    const account = await this.accountsService.createTransporterAccount(
      this.toCreateTransporterAccountInput(registerDto, passwordHash),
    );

    return this.toAuthUserView(account);
  }

  async login(loginDto: LoginDto): Promise<AuthUserView> {
    const account = await this.accountsService.findByEmail(loginDto.email);

    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordService.verify(
      loginDto.password,
      account.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.toAuthUserView(account);
  }

  private toCreateClientAccountInput(
    registerDto: RegisterClientDto,
    passwordHash: string,
  ) {
    return {
      email: registerDto.email,
      passwordHash,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      phone: registerDto.phone ?? null,
    };
  }

  private toCreateTransporterAccountInput(
    registerDto: RegisterTransporterDto,
    passwordHash: string,
  ) {
    return {
      email: registerDto.email,
      passwordHash,
      displayName: registerDto.displayName,
      businessName: registerDto.businessName ?? null,
      contactPhone: registerDto.contactPhone ?? null,
      bio: registerDto.bio ?? null,
    };
  }

  private toAuthUserView(account: AccountWithProfiles): AuthUserView {
    const profile =
      account.role === 'CLIENT'
        ? account.userProfile
          ? {
              id: account.userProfile.id,
              firstName: account.userProfile.firstName,
              lastName: account.userProfile.lastName,
              phone: account.userProfile.phone,
            }
          : null
        : account.transporterProfile
          ? {
              id: account.transporterProfile.id,
              displayName: account.transporterProfile.displayName,
              businessName: account.transporterProfile.businessName,
              contactPhone: account.transporterProfile.contactPhone,
              bio: account.transporterProfile.bio,
            }
          : null;

    return {
      account: {
        id: account.id,
        email: account.email,
        role: account.role,
        isEmailVerified: account.isEmailVerified,
      },
      profile,
    };
  }
}
