import { AuthRouteGuard } from "@/features/auth/components/guards/auth-route-guard";

type AdminLayoutProps = {
  children: React.ReactNode;
};

const ALLOWED_ADMIN_ROLES = ["ADMIN"] as const;

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AuthRouteGuard allowedRoles={ALLOWED_ADMIN_ROLES} mode="protected">
      {children}
    </AuthRouteGuard>
  );
}
