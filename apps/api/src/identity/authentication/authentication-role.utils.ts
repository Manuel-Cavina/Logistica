import type { AccountRole } from '@logistica/shared';
import type { AuthSessionAccount } from './types/authentication.types';

type RoleAwareAccount = Pick<AuthSessionAccount, 'role'> & {
  transporterProfile?: object | null;
  userProfile?: object | null;
};

export function resolveEffectiveAccountRole(
  account: RoleAwareAccount,
): AccountRole {
  if (account.role !== 'CLIENT') {
    return account.role;
  }

  if (account.transporterProfile) {
    return 'TRANSPORTER';
  }

  return account.role;
}
