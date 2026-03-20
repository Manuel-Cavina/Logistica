import { Injectable } from '@nestjs/common';
import { PrismaService, type Session } from '@logistica/database';
import { accountWithProfilesInclude } from '../../accounts/types/accounts.types';
import type {
  CreateSessionInput,
  SessionWithAccount,
} from '../types/authentication.types';

@Injectable()
export class SessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(input: CreateSessionInput): Promise<Session> {
    const {
      id,
      accountId,
      tokenHash,
      tokenFamily,
      expiresAt,
      userAgent,
      ipAddress,
    } = input;

    return this.prisma.session.create({
      data: {
        id,
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
      include: {
        account: {
          include: accountWithProfilesInclude,
        },
      },
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

  async revokeSessionsByAccount(
    accountId: string,
    revokedAt: Date = new Date(),
  ): Promise<number> {
    const result = await this.prisma.session.updateMany({
      where: {
        accountId,
        revokedAt: null,
      },
      data: { revokedAt },
    });

    return result.count;
  }

  async rotateSession(
    currentSessionId: string,
    successorSession: CreateSessionInput,
    revokedAt: Date = new Date(),
  ): Promise<Session | null> {
    return this.prisma.$transaction(async (tx) => {
      const revokeResult = await tx.session.updateMany({
        where: {
          id: currentSessionId,
          revokedAt: null,
        },
        data: { revokedAt },
      });

      if (revokeResult.count === 0) {
        return null;
      }

      return tx.session.create({
        data: {
          id: successorSession.id,
          accountId: successorSession.accountId,
          tokenHash: successorSession.tokenHash,
          tokenFamily: successorSession.tokenFamily,
          expiresAt: successorSession.expiresAt,
          userAgent: successorSession.userAgent ?? null,
          ipAddress: successorSession.ipAddress ?? null,
        },
      });
    });
  }
}
