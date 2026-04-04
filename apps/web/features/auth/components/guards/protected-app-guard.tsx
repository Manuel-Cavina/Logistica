"use client";

import { AuthRouteGuard } from "./auth-route-guard";
import { TransporterProfileGuard } from "./transporter-profile-guard";

type ProtectedAppGuardProps = {
  children: React.ReactNode;
};

export function ProtectedAppGuard({ children }: ProtectedAppGuardProps) {
  return (
    <AuthRouteGuard mode="protected">
      <TransporterProfileGuard>{children}</TransporterProfileGuard>
    </AuthRouteGuard>
  );
}
