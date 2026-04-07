"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransporterOnboardingShell } from "./transporter-onboarding-shell";
import { TransporterProfileSummary } from "./transporter-profile-summary";
import { TransporterVerificationSummaryCard } from "./transporter-verification-summary-card";
import type { TransporterProfile } from "../types/transporter-profile.types";

const DASHBOARD_PATH = "/dashboard";
export const VERIFIED_REDIRECT_DELAY_MS = 1800;

type TransporterOnboardingVerifiedViewProps = {
  profile: TransporterProfile;
  redirectDelayMs?: number;
};

export function TransporterOnboardingVerifiedView({
  profile,
  redirectDelayMs = VERIFIED_REDIRECT_DELAY_MS,
}: TransporterOnboardingVerifiedViewProps) {
  const router = useRouter();

  useEffect(() => {
    const redirectTimeoutId = window.setTimeout(() => {
      router.replace(DASHBOARD_PATH);
    }, redirectDelayMs);

    return () => {
      window.clearTimeout(redirectTimeoutId);
    };
  }, [redirectDelayMs, router]);

  return (
    <TransporterOnboardingShell
      description="Tu perfil fue aprobado. Esta confirmacion se muestra una unica vez antes de llevarte al dashboard."
      eyebrow="Perfil aprobado"
      statusLabel="Estado: verificado"
      title="Tu perfil ya esta listo para operar"
      tone="success"
    >
      <Card className="border-white/70 bg-white/85 shadow-[0_16px_40px_rgba(21,40,33,0.08)]">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[#c8e0cf] bg-[#edf8f0] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#1f5136]">
              Confirmacion final
            </span>
            <span className="rounded-full border border-border/70 bg-panel/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Redireccion automatica
            </span>
          </div>
          <div className="space-y-2">
            <CardTitle>Ya podes continuar al dashboard cuando termine la confirmacion</CardTitle>
            <CardDescription>
              Mostramos esta pantalla una sola vez para dejar claro que el
              perfil quedo aprobado y listo para operar.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <article className="rounded-[1.5rem] border border-border/70 bg-background/80 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                Estado
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-foreground">
                Verificacion completada
              </p>
            </article>
            <article className="rounded-[1.5rem] border border-border/70 bg-background/80 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                Flujo
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-foreground">
                Redireccion al dashboard
              </p>
            </article>
            <article className="rounded-[1.5rem] border border-border/70 bg-background/80 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                Siguiente
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-foreground">
                Publicar capacidad y operar
              </p>
            </article>
          </div>
        </CardContent>
      </Card>

      <TransporterVerificationSummaryCard
        description="Tu perfil ya fue aprobado y esta listo para publicar capacidad y gestionar reservas."
        showCta={false}
        status="VERIFIED"
        title="Verificacion completada con exito"
        className="border-white/70 bg-white/85 shadow-[0_16px_40px_rgba(21,40,33,0.08)]"
      />

      <Card className="border-white/70 bg-white/85 shadow-[0_16px_40px_rgba(21,40,33,0.08)]">
        <CardHeader>
          <CardTitle>Te llevamos al dashboard en unos segundos</CardTitle>
          <CardDescription>
            Desde ahi vas a poder continuar con la operacion del transportista
            sin volver a esta etapa de onboarding.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm leading-6 text-muted">
            Si no ocurre automaticamente, vuelve al dashboard desde la navegacion
            principal.
          </p>
        </CardContent>
      </Card>

      <TransporterProfileSummary profile={profile} />
    </TransporterOnboardingShell>
  );
}
