"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransporterOnboardingShell } from "./transporter-onboarding-shell";

type TransporterOnboardingErrorViewProps = {
  error: string;
  onRetry: () => void;
};

export function TransporterOnboardingErrorView({
  error,
  onRetry,
}: TransporterOnboardingErrorViewProps) {
  return (
    <TransporterOnboardingShell
      description="La pantalla de onboarding depende del estado real del backend. Si no pudimos leerlo, frenamos la experiencia para no mostrar una vista incorrecta."
      eyebrow="Error de carga"
      statusLabel="No disponible"
      title="No pudimos cargar tu onboarding"
      tone="warning"
    >
      <Card className="border-white/70 bg-white/85 shadow-[0_16px_40px_rgba(21,40,33,0.08)]">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[#e7b9a2] bg-[#fff2ea] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#7d3b1a]">
              Hay un problema temporal
            </span>
            <span className="rounded-full border border-border/70 bg-panel/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Seguramente se resuelve al reintentar
            </span>
          </div>
          <div className="space-y-2">
            <CardTitle>Reintentamos leer tu estado para no mostrarte una vista incorrecta</CardTitle>
            <CardDescription>
              Si el problema persiste, revisa tu sesion y probalo de nuevo en unos
              segundos.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-[1.5rem] border border-[#e9cbb8] bg-[#fff4ed] px-4 py-4 text-sm leading-6 text-[#6f3b1f]">
            {error}
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,16rem)_1fr] sm:items-center">
            <Button className="w-full sm:max-w-[16rem]" onClick={onRetry}>
              Reintentar
            </Button>
            <p className="text-sm leading-6 text-muted">
              Si el backend sigue sin responder, volvemos a leer el perfil sin
              cambiar el estado guardado del usuario.
            </p>
          </div>
        </CardContent>
      </Card>
    </TransporterOnboardingShell>
  );
}
