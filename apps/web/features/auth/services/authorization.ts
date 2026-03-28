import type { AllowedRoles, AuthRole } from "../types/auth.types";

export const DEFAULT_AUTHENTICATED_REDIRECT_PATH = "/dashboard";

export const DEFAULT_AUTHENTICATED_PATH_BY_ROLE: Record<AuthRole, string> = {
  CLIENT: DEFAULT_AUTHENTICATED_REDIRECT_PATH,
  TRANSPORTER: DEFAULT_AUTHENTICATED_REDIRECT_PATH,
  ADMIN: DEFAULT_AUTHENTICATED_REDIRECT_PATH,
};

export function hasRequiredRole(
  userRole: AuthRole | null | undefined,
  allowedRoles?: AllowedRoles,
): boolean {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (!userRole) {
    return false;
  }

  return allowedRoles.includes(userRole);
}

export function getDefaultAuthorizedPath(
  userRole: AuthRole | null | undefined,
): string {
  if (!userRole) {
    return DEFAULT_AUTHENTICATED_REDIRECT_PATH;
  }

  return DEFAULT_AUTHENTICATED_PATH_BY_ROLE[userRole];
}
