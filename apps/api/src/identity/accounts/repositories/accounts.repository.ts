import { Injectable } from '@nestjs/common';
import { AccountRole, PrismaService } from '@logistica/database';
import {
  accountWithProfilesInclude,
  type AccountWithProfiles,
  type CreateClientAccountInput,
  type CreateTransporterAccountInput,
} from '../types/accounts.types';

@Injectable()
export class AccountsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<AccountWithProfiles | null> {
    return this.prisma.account.findUnique({
      where: { email },
      include: accountWithProfilesInclude,
    });
  }

  async findById(id: string): Promise<AccountWithProfiles | null> {
    return this.prisma.account.findUnique({
      where: { id },
      include: accountWithProfilesInclude,
    });
  }

  async createClientAccount(
    input: CreateClientAccountInput,
  ): Promise<AccountWithProfiles> {
    const { email, passwordHash, firstName, lastName, phone } = input;

    return this.prisma.account.create({
      data: {
        email,
        passwordHash,
        role: AccountRole.CLIENT,
        userProfile: {
          create: {
            firstName,
            lastName,
            phone: phone ?? null,
          },
        },
      },
      include: accountWithProfilesInclude,
    });
  }

  async createTransporterAccount(
    input: CreateTransporterAccountInput,
  ): Promise<AccountWithProfiles> {
    const { email, passwordHash, displayName } = input;

    return this.prisma.account.create({
      data: {
        email,
        passwordHash,
        role: AccountRole.TRANSPORTER,
        transporterProfile: {
          create: {
            displayName,
          },
        },
      },
      include: accountWithProfilesInclude,
    });
  }
}
