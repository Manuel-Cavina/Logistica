"use client";

import { useAuth } from "./use-auth";
import {
  getDefaultAuthorizedPath,
  hasRequiredRole,
} from "../services/authorization";
import type { AllowedRoles, AuthRole } from "../types/auth.types";

type UseAuthorizationResult = {
  role: AuthRole | null;
  hasRole: (allowedRoles?: AllowedRoles) => boolean;
  isAuthorized: (allowedRoles?: AllowedRoles) => boolean;
  getDefaultPath: () => string;
};

export function useAuthorization(): UseAuthorizationResult {
  const { status, user } = useAuth();
  const role = user?.role ?? null;
  const isAuthenticated = status === "authenticated";

  return {
    role,
    hasRole: (allowedRoles?: AllowedRoles) => hasRequiredRole(role, allowedRoles),
    isAuthorized: (allowedRoles?: AllowedRoles) =>
      isAuthenticated && hasRequiredRole(role, allowedRoles),
    getDefaultPath: () => getDefaultAuthorizedPath(role),
  };
}
