import { AuthRouteGuard } from "@/features/auth/components/auth-route-guard";

type ProtectedLayoutProps = {
  children: React.ReactNode;
};

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return <AuthRouteGuard mode="protected">{children}</AuthRouteGuard>;
}
