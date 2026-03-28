import {
  DEFAULT_AUTHENTICATED_REDIRECT_PATH,
  getDefaultAuthorizedPath,
  hasRequiredRole,
} from "../services/authorization";
import type { AllowedRoles, AuthRole, AuthStatus } from "../types/auth.types";

export type AuthRouteGuardMode = "protected" | "guest-only";

type ResolveAuthRouteAccessInput = {
  allowedRoles?: AllowedRoles;
  isBootstrapped: boolean;
  mode: AuthRouteGuardMode;
  status: AuthStatus;
  userRole?: AuthRole | null;
};

type AuthRouteAccessResolution =
  | {
      action: "fallback";
    }
  | {
      action: "redirect";
      redirectTo: string;
    }
  | {
      action: "unauthorized";
    }
  | {
      action: "render";
    };

export const AUTHENTICATED_REDIRECT_PATH = DEFAULT_AUTHENTICATED_REDIRECT_PATH;
export const UNAUTHENTICATED_REDIRECT_PATH = "/";

export function resolveAuthRouteAccess({
  allowedRoles,
  isBootstrapped,
  mode,
  status,
  userRole,
}: ResolveAuthRouteAccessInput): AuthRouteAccessResolution {
  if (!isBootstrapped || status === "loading") {
    return { action: "fallback" };
  }

  if (mode === "protected") {
    if (status !== "authenticated") {
      return {
        action: "redirect",
        redirectTo: UNAUTHENTICATED_REDIRECT_PATH,
      };
    }

    return hasRequiredRole(userRole, allowedRoles)
      ? { action: "render" }
      : { action: "unauthorized" };
  }

  return status === "unauthenticated"
    ? { action: "render" }
    : {
        action: "redirect",
        redirectTo: getDefaultAuthorizedPath(userRole),
      };
}
