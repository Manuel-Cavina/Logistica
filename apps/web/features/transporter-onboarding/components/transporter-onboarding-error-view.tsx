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
      <Card className="p-6 sm:p-8">
        <CardHeader>
          <CardTitle>Reintenta la carga del perfil</CardTitle>
          <CardDescription>
            Si el problema persiste, revisa tu sesion o vuelve a intentar en unos segundos.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-[1.4rem] border border-[#e9cbb8] bg-[#fff4ed] px-4 py-4 text-sm leading-6 text-[#6f3b1f]">
            {error}
          </div>
          <Button className="mt-2 max-w-[16rem]" onClick={onRetry}>
            Reintentar
          </Button>
        </CardContent>
      </Card>
    </TransporterOnboardingShell>
  );
}
