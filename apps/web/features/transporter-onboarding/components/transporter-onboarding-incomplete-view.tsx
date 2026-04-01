import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTransporterVerificationStatusConfig } from "../config/transporter-verification-status.config";
import { TransporterOnboardingShell } from "./transporter-onboarding-shell";
import { TransporterProfileForm } from "./transporter-profile-form";
import { TransporterProfileSummary } from "./transporter-profile-summary";
import { TransporterVerificationSummaryCard } from "./transporter-verification-summary-card";
import type { TransporterProfile } from "../types/transporter-profile.types";

type TransporterOnboardingIncompleteViewProps = {
  onSuccess: () => void;
  profile: TransporterProfile | null;
};

const minimumRequirements = [
  "Nombre visible del transportista",
  "Telefono de contacto operativo",
  "Informacion base lista para enviar tu perfil a revision",
];

export function TransporterOnboardingIncompleteView({
  onSuccess,
  profile,
}: TransporterOnboardingIncompleteViewProps) {
  const statusConfig = getTransporterVerificationStatusConfig("INCOMPLETE");

  return (
    <TransporterOnboardingShell
      description="Esta etapa prepara la informacion minima del perfil para que la verificacion manual pueda arrancar sin friccion."
      eyebrow="Perfil inicial"
      statusLabel={`Estado: ${statusConfig.label.toLowerCase()}`}
      title="Completa tu onboarding para empezar a operar como transportista"
    >
      <TransporterVerificationSummaryCard status="INCOMPLETE" />

      <Card className="p-6 sm:p-8">
        <CardHeader>
          <CardTitle>Tu perfil todavia necesita informacion base</CardTitle>
          <CardDescription>
            Completa estos datos para dejar tu perfil listo para revision y evitar
            demoras en la validacion.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3">
            {minimumRequirements.map((requirement) => (
              <div
                key={requirement}
                className="rounded-[1.4rem] border border-border/70 bg-background/70 px-4 py-4 text-sm leading-6 text-foreground"
              >
                {requirement}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {profile ? <TransporterProfileSummary profile={profile} /> : null}
      <TransporterProfileForm defaultProfile={profile} onSuccess={onSuccess} />
    </TransporterOnboardingShell>
  );
}
