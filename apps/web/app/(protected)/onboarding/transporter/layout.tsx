import { AuthRouteGuard } from "@/features/auth/components/guards/auth-route-guard";

type TransporterOnboardingLayoutProps = {
  children: React.ReactNode;
};

const ALLOWED_TRANSPORTER_ROLES = ["TRANSPORTER"] as const;

export default function TransporterOnboardingLayout({
  children,
}: TransporterOnboardingLayoutProps) {
  return (
    <AuthRouteGuard allowedRoles={ALLOWED_TRANSPORTER_ROLES} mode="protected">
      {children}
    </AuthRouteGuard>
  );
}
