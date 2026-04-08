import { AuthRouteGuard } from "@/features/auth/components/guards/auth-route-guard";

type VehiclesLayoutProps = {
  children: React.ReactNode;
};

const ALLOWED_TRANSPORTER_ROLES = ["TRANSPORTER"] as const;

export default function VehiclesLayout({ children }: VehiclesLayoutProps) {
  return (
    <AuthRouteGuard allowedRoles={ALLOWED_TRANSPORTER_ROLES} mode="protected">
      {children}
    </AuthRouteGuard>
  );
}
