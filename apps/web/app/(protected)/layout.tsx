import { ProtectedAppGuard } from "@/features/auth/components/protected-app-guard";

type ProtectedLayoutProps = {
  children: React.ReactNode;
};

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return <ProtectedAppGuard>{children}</ProtectedAppGuard>;
}
