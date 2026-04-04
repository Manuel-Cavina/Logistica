import type { TransporterVerificationStatus } from "@/features/transporter-onboarding/types/transporter-profile.types";

export const TRANSPORTER_ONBOARDING_PATH = "/onboarding/transporter";

export type TransporterRouteRequestStatus =
  | "idle"
  | "loading"
  | "success"
  | "error";

type ResolveTransporterRouteAccessInput = {
  pathname: string;
  requestStatus: TransporterRouteRequestStatus;
  verificationStatus: TransporterVerificationStatus | null;
};

type TransporterRouteAccessResolution =
  | {
      action: "fallback";
    }
  | {
      action: "error";
    }
  | {
      action: "redirect";
      redirectTo: string;
    }
  | {
      action: "render";
    };

export function isTransporterOnboardingPath(pathname: string): boolean {
  return (
    pathname === TRANSPORTER_ONBOARDING_PATH ||
    pathname.startsWith(`${TRANSPORTER_ONBOARDING_PATH}/`)
  );
}

export function resolveTransporterRouteAccess({
  pathname,
  requestStatus,
  verificationStatus,
}: ResolveTransporterRouteAccessInput): TransporterRouteAccessResolution {
  if (requestStatus === "idle" || requestStatus === "loading") {
    return { action: "fallback" };
  }

  if (requestStatus === "error") {
    return { action: "error" };
  }

  const normalizedVerificationStatus = verificationStatus ?? "INCOMPLETE";

  switch (normalizedVerificationStatus) {
    case "PENDING":
    case "VERIFIED":
      return { action: "render" };
    case "INCOMPLETE":
    case "REJECTED":
      return isTransporterOnboardingPath(pathname)
        ? { action: "render" }
        : {
            action: "redirect",
            redirectTo: TRANSPORTER_ONBOARDING_PATH,
          };
  }
}
