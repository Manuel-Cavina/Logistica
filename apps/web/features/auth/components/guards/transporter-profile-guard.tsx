"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../hooks/use-auth";
import { useTransporterGuardProfile } from "../../hooks/use-transporter-guard-profile";
import { ProtectedRouteError, ProtectedRouteLoading } from "../feedback/protected-route-status";
import { resolveTransporterRouteAccess } from "../../services/authorization/transporter-route-access";

type TransporterProfileGuardProps = {
  children: React.ReactNode;
};

export function TransporterProfileGuard({
  children,
}: TransporterProfileGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, user } = useAuth();
  const isTransporter = status === "authenticated" && user?.role === "TRANSPORTER";
  const transporterProfile = useTransporterGuardProfile({
    enabled: isTransporter,
  });
  const resolution = resolveTransporterRouteAccess({
    pathname,
    requestStatus: isTransporter ? transporterProfile.requestStatus : "success",
    verificationStatus: isTransporter
      ? transporterProfile.verificationStatus
      : "VERIFIED",
  });
  const redirectTo = resolution.action === "redirect" ? resolution.redirectTo : null;

  useEffect(() => {
    if (!redirectTo || pathname === redirectTo) {
      return;
    }

    router.replace(redirectTo);
  }, [pathname, redirectTo, router]);

  if (!isTransporter) {
    return <>{children}</>;
  }

  if (resolution.action === "render") {
    return <>{children}</>;
  }

  if (resolution.action === "error") {
    return (
      <ProtectedRouteError
        error={
          transporterProfile.error ??
          "No pudimos validar tu perfil de transportista."
        }
        onRetry={transporterProfile.refetch}
      />
    );
  }

  return <ProtectedRouteLoading />;
}
