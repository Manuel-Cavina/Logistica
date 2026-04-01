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
      <TransporterVerificationSummaryCard
        description="Tu perfil ya fue aprobado y esta listo para publicar capacidad y gestionar reservas."
        showCta={false}
        status="VERIFIED"
        title="Verificacion completada con exito"
      />

      <Card className="p-6 sm:p-8">
        <CardHeader>
          <CardTitle>Te llevamos al dashboard en unos segundos</CardTitle>
          <CardDescription>
            Desde ahi vas a poder continuar con la operacion del transportista sin volver
            a esta etapa de onboarding.
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
