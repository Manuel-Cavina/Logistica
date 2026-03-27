import type { AuthStatus } from "../types/auth.types";

export type AuthRouteGuardMode = "protected" | "guest-only";

type ResolveAuthRouteAccessInput = {
  isBootstrapped: boolean;
  mode: AuthRouteGuardMode;
  status: AuthStatus;
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
      action: "render";
    };

export const AUTHENTICATED_REDIRECT_PATH = "/dashboard";
export const UNAUTHENTICATED_REDIRECT_PATH = "/";

export function resolveAuthRouteAccess({
  isBootstrapped,
  mode,
  status,
}: ResolveAuthRouteAccessInput): AuthRouteAccessResolution {
  if (!isBootstrapped || status === "loading") {
    return { action: "fallback" };
  }

  if (mode === "protected") {
    return status === "authenticated"
      ? { action: "render" }
      : {
          action: "redirect",
          redirectTo: UNAUTHENTICATED_REDIRECT_PATH,
        };
  }

  return status === "unauthenticated"
    ? { action: "render" }
    : {
        action: "redirect",
        redirectTo: AUTHENTICATED_REDIRECT_PATH,
      };
}
