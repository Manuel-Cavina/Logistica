import { AuthRouteGuard } from "@/features/auth/components/guards/auth-route-guard";

type GuestLayoutProps = {
  children: React.ReactNode;
};

export default function GuestLayout({ children }: GuestLayoutProps) {
  return <AuthRouteGuard mode="guest-only">{children}</AuthRouteGuard>;
}
