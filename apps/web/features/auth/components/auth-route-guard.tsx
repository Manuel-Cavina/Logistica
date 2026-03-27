"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../hooks/use-auth";
import {
  resolveAuthRouteAccess,
  type AuthRouteGuardMode,
} from "./auth-route-access";

type AuthRouteGuardProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  mode: AuthRouteGuardMode;
};

function DefaultGuardFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-border bg-panel p-8 text-center shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted">
          Logistica
        </p>
        <h1 className="mt-4 font-heading text-3xl font-semibold text-foreground">
          Validando acceso
        </h1>
        <p className="mt-3 text-base leading-7 text-muted">
          Estamos restaurando tu sesion para mostrar la vista correcta.
        </p>
      </div>
    </main>
  );
}

export function AuthRouteGuard({
  children,
  fallback,
  mode,
}: AuthRouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isBootstrapped, status } = useAuth();
  const resolution = resolveAuthRouteAccess({
    isBootstrapped,
    mode,
    status,
  });
  const redirectTo = resolution.action === "redirect" ? resolution.redirectTo : null;

  useEffect(() => {
    if (!redirectTo || pathname === redirectTo) {
      return;
    }

    router.replace(redirectTo);
  }, [pathname, redirectTo, router]);

  if (resolution.action === "render") {
    return <>{children}</>;
  }

  return <>{fallback ?? <DefaultGuardFallback />}</>;
}
