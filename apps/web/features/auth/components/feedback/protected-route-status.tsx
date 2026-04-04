"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ProtectedRouteLoadingProps = {
  description?: string;
  title?: string;
};

type ProtectedRouteErrorProps = {
  error: string;
  onRetry: () => void;
};

export function ProtectedRouteLoading({
  description = "Estamos validando tu acceso y el estado actual de tu perfil antes de mostrar esta seccion.",
  title = "Validando acceso",
}: ProtectedRouteLoadingProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6 py-16">
      <div className="w-full max-w-3xl space-y-4">
        <div className="rounded-3xl border border-border bg-panel p-8 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted">
            Logistica
          </p>
          <h1 className="mt-4 font-heading text-3xl font-semibold text-foreground">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
            {description}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-52 animate-pulse rounded-[2rem] border border-border/70 bg-panel/85" />
          <div className="h-52 animate-pulse rounded-[2rem] border border-border/70 bg-panel/70" />
        </div>
      </div>
    </main>
  );
}

export function ProtectedRouteError({
  error,
  onRetry,
}: ProtectedRouteErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6 py-16">
      <Card className="w-full max-w-2xl p-6 sm:p-8">
        <CardHeader>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted">
            Logistica
          </p>
          <CardTitle className="mt-3 font-heading text-3xl">
            No pudimos validar tu perfil
          </CardTitle>
          <CardDescription className="text-base leading-7">
            Frenamos la navegacion para no mostrar una vista incorrecta. Cuando el
            backend vuelva a responder, retomamos el flujo desde donde estabas.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-[1.6rem] border border-[#e9cbb8] bg-[#fff4ed] px-4 py-4 text-sm leading-6 text-[#6f3b1f]">
            {error}
          </div>
          <Button className="max-w-[14rem]" onClick={onRetry} type="button">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
