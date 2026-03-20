import { Prisma } from '@logistica/database';

export const accountWithProfilesInclude =
  Prisma.validator<Prisma.AccountInclude>()({
    userProfile: true,
    transporterProfile: true,
  });

export type AccountWithProfiles = Prisma.AccountGetPayload<{
  include: typeof accountWithProfilesInclude;
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
}
