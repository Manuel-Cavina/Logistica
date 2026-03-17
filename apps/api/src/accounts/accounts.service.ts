import { Injectable } from '@nestjs/common';
import { AccountRole, PrismaService, type Session } from '@logistica/database';
import {
  accountWithProfilesInclude,
  type AccountWithProfiles,
  type CreateClientAccountInput,
  type CreateSessionInput,
  type CreateTransporterAccountInput,
  sessionWithAccountInclude,
  type SessionWithAccount,
} from './accounts.types';

@Injectable()
export class AccountsService {
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
    const {
      email,
      passwordHash,
      displayName,
      businessName,
      contactPhone,
      bio,
    } = input;

    return this.prisma.account.create({
      data: {
        email,
        passwordHash,
        role: AccountRole.TRANSPORTER,
        transporterProfile: {
          create: {
            displayName,
            businessName: businessName ?? null,
            contactPhone: contactPhone ?? null,
            bio: bio ?? null,
          },
        },
      },
      include: accountWithProfilesInclude,
    });
  }

  async createSession(input: CreateSessionInput): Promise<Session> {
    const {
      accountId,
      tokenHash,
      tokenFamily,
      expiresAt,
      userAgent,
      ipAddress,
    } = input;

    return this.prisma.session.create({
      data: {
        accountId,
        tokenHash,
        tokenFamily,
        expiresAt,
        userAgent: userAgent ?? null,
        ipAddress: ipAddress ?? null,
      },
    });
  }

  async findSessionById(id: string): Promise<SessionWithAccount | null> {
    return this.prisma.session.findUnique({
      where: { id },
      include: sessionWithAccountInclude,
    });
  }

  async revokeSession(
    id: string,
    revokedAt: Date = new Date(),
  ): Promise<number> {
    const result = await this.prisma.session.updateMany({
      where: {
        id,
        revokedAt: null,
      },
      data: { revokedAt },
    });

    return result.count;
  }

  async revokeSessionFamily(
    accountId: string,
    tokenFamily: string,
    revokedAt: Date = new Date(),
  ): Promise<number> {
    const result = await this.prisma.session.updateMany({
      where: {
        accountId,
        tokenFamily,
        revokedAt: null,
      },
      data: { revokedAt },
    });

    return result.count;
  }
}
