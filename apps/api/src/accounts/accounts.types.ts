import { Prisma } from '@logistica/database';

export const accountWithProfilesInclude =
  Prisma.validator<Prisma.AccountInclude>()({
    userProfile: true,
    transporterProfile: true,
  });

export const sessionWithAccountInclude =
  Prisma.validator<Prisma.SessionInclude>()({
    account: {
      include: accountWithProfilesInclude,
    },
  });

export type AccountWithProfiles = Prisma.AccountGetPayload<{
  include: typeof accountWithProfilesInclude;
}>;

export type SessionWithAccount = Prisma.SessionGetPayload<{
  include: typeof sessionWithAccountInclude;
}>;

export interface CreateClientAccountInput {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
}

export interface CreateTransporterAccountInput {
  email: string;
  passwordHash: string;
  displayName: string;
  businessName?: string | null;
  contactPhone?: string | null;
  bio?: string | null;
}

export interface CreateSessionInput {
  accountId: string;
  tokenHash: string;
  tokenFamily: string;
  expiresAt: Date;
  userAgent?: string | null;
  ipAddress?: string | null;
}
